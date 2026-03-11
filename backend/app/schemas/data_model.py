"""
Data-model schemas.

Strategy: PUT /api/projects/{id}/data-model  →  upsert (delete-all + re-create).
The full frontend Table/Relationship objects are stored as-is in a JSON snapshot
column (we reuse `triggers` on UseCase but here we store directly in the
structured DataTable / DataColumn / DataRelationship rows AND return the
reconstructed frontend objects).

For simplicity we just accept the full frontend payload and store every table
with its columns.  Relationships reference tables by their *frontend* string id
so we keep a mapping.
"""

from typing import Optional
from pydantic import BaseModel


# ── Column ─────────────────────────────────────────────────────────────────────

class ColumnSchema(BaseModel):
    id: str
    name: str
    type: str
    isPk: bool = False
    isFk: bool = False
    isNullable: bool = True
    defaultValue: Optional[str] = None
    references: Optional[dict] = None  # {tableId, columnId}


# ── Table ──────────────────────────────────────────────────────────────────────

class TableSchema(BaseModel):
    id: str
    name: str
    columns: list[ColumnSchema] = []
    position: dict = {"x": 100, "y": 100}


# ── Relationship ───────────────────────────────────────────────────────────────

class RelationshipSchema(BaseModel):
    id: str
    fromTable: str
    toTable: str
    type: str = "1:N"


# ── Payload ────────────────────────────────────────────────────────────────────

class DataModelSave(BaseModel):
    tables: list[TableSchema] = []
    relationships: list[RelationshipSchema] = []


class DataModelOut(BaseModel):
    tables: list[TableSchema] = []
    relationships: list[RelationshipSchema] = []
