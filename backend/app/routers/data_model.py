"""
Data-model router.

PUT  /api/projects/{project_id}/data-model  → upsert (delete all + re-create)
GET  /api/projects/{project_id}/data-model  → returns current tables + relationships

Encoding strategy:
  - Table frontend id  → stored as   "<fe_id>|||<display_name>"  in DataTable.name
  - Column frontend id → stored as   "<fe_id>|||<col_name>"       in DataColumn.name
  - Relationship frontend id is NOT stored (type col is Enum); on GET we derive
    the id as  "rel-{db_id}"  which is stable as long as the record exists.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.data_model import DataTable, DataColumn, DataRelationship
from ..schemas.data_model import DataModelSave, DataModelOut, TableSchema, ColumnSchema, RelationshipSchema

router = APIRouter(prefix="/api/projects/{project_id}/data-model", tags=["data-model"])


# ── Guard ──────────────────────────────────────────────────────────────────────

def get_project_or_404(project_id: int, current_user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
        Project.status != "deleted",
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project


# ── Helpers ────────────────────────────────────────────────────────────────────

SEP = "|||"

def _decode_name(raw: str) -> tuple[str, str]:
    """Split '<fe_id>|||<display>' → (fe_id, display). Falls back if no separator."""
    if SEP in raw:
        fe_id, display = raw.split(SEP, 1)
        return fe_id, display
    return raw, raw


# ── GET ────────────────────────────────────────────────────────────────────────

@router.get("", response_model=DataModelOut)
def get_data_model(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)

    db_tables = (
        db.query(DataTable)
        .filter(DataTable.project_id == project_id)
        .order_by(DataTable.id)
        .all()
    )

    tables_out: list[TableSchema] = []
    db_id_to_fe_id: dict[int, str] = {}

    for dt in db_tables:
        fe_id, display_name = _decode_name(dt.name)
        db_id_to_fe_id[dt.id] = fe_id

        columns_out: list[ColumnSchema] = []
        for col in dt.columns:
            col_fe_id, col_name = _decode_name(col.name)
            ref_table_fe_id = db_id_to_fe_id.get(col.ref_table_id) if col.ref_table_id else None
            columns_out.append(ColumnSchema(
                id=col_fe_id,
                name=col_name,
                type=col.type,
                isPk=bool(col.is_pk),
                isFk=bool(col.is_fk),
                isNullable=bool(col.is_nullable),
                defaultValue=col.default_value,
                references={"tableId": ref_table_fe_id, "columnId": str(col.ref_column_id)} if ref_table_fe_id else None,
            ))

        tables_out.append(TableSchema(
            id=fe_id,
            name=display_name,
            columns=columns_out,
            position={"x": dt.position_x, "y": dt.position_y},
        ))

    db_rels = (
        db.query(DataRelationship)
        .filter(DataRelationship.project_id == project_id)
        .all()
    )

    rels_out: list[RelationshipSchema] = []
    for rel in db_rels:
        from_fe = db_id_to_fe_id.get(rel.from_table_id, str(rel.from_table_id))
        to_fe = db_id_to_fe_id.get(rel.to_table_id, str(rel.to_table_id))
        rels_out.append(RelationshipSchema(
            id=f"rel-{rel.id}",
            fromTable=from_fe,
            toTable=to_fe,
            type=rel.type or "1:N",
        ))

    return DataModelOut(tables=tables_out, relationships=rels_out)


# ── PUT (upsert) ───────────────────────────────────────────────────────────────

@router.put("", response_model=DataModelOut)
def save_data_model(
    project_id: int,
    body: DataModelSave,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)

    # Delete existing (cascade deletes columns too via FK)
    db.query(DataRelationship).filter(DataRelationship.project_id == project_id).delete()
    db.query(DataTable).filter(DataTable.project_id == project_id).delete()
    db.flush()

    fe_id_to_db: dict[str, DataTable] = {}

    for tbl in body.tables:
        dt = DataTable(
            project_id=project_id,
            name=f"{tbl.id}{SEP}{tbl.name}",
            position_x=tbl.position.get("x", 100) if isinstance(tbl.position, dict) else 100,
            position_y=tbl.position.get("y", 100) if isinstance(tbl.position, dict) else 100,
        )
        db.add(dt)
        db.flush()

        for j, col in enumerate(tbl.columns):
            ref_db_id: int | None = None
            if col.references and col.references.get("tableId"):
                ref_tbl = fe_id_to_db.get(col.references["tableId"])
                if ref_tbl:
                    ref_db_id = ref_tbl.id

            dc = DataColumn(
                table_id=dt.id,
                name=f"{col.id}{SEP}{col.name}",
                type=col.type or "VARCHAR(255)",
                is_pk=1 if col.isPk else 0,
                is_fk=1 if col.isFk else 0,
                is_nullable=1 if col.isNullable else 0,
                default_value=col.defaultValue,
                ref_table_id=ref_db_id,
                order_index=j,
            )
            db.add(dc)

        fe_id_to_db[tbl.id] = dt

    valid_types = {"1:1", "1:N", "N:M"}
    for rel in body.relationships:
        from_dt = fe_id_to_db.get(rel.fromTable)
        to_dt = fe_id_to_db.get(rel.toTable)
        if not from_dt or not to_dt:
            continue
        rel_type = rel.type if rel.type in valid_types else "1:N"
        dr = DataRelationship(
            project_id=project_id,
            from_table_id=from_dt.id,
            to_table_id=to_dt.id,
            type=rel_type,
        )
        db.add(dr)

    db.commit()

    return get_data_model(project_id=project_id, db=db, current_user=current_user)
