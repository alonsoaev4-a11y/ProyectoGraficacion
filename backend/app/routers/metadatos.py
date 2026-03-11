from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.metadatos import ProjectMetadatos
from ..schemas.metadatos import MetadatosUpsert, MetadatosOut

router = APIRouter(prefix="/api/projects/{project_id}/metadatos", tags=["metadatos"])


def _assert_project_owner(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id,
        Project.status != "deleted",
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    return project


@router.get("", response_model=MetadatosOut | None)
def get_metadatos(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_project_owner(project_id, current_user.id, db)
    meta = db.query(ProjectMetadatos).filter(ProjectMetadatos.project_id == project_id).first()
    return meta  # None si no existe aún


@router.put("", response_model=MetadatosOut)
def upsert_metadatos(
    project_id: int,
    payload: MetadatosUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crea o reemplaza los metadatos del proyecto (upsert)."""
    _assert_project_owner(project_id, current_user.id, db)
    meta = db.query(ProjectMetadatos).filter(ProjectMetadatos.project_id == project_id).first()
    if meta:
        meta.data = payload.data
    else:
        meta = ProjectMetadatos(project_id=project_id, data=payload.data)
        db.add(meta)
    db.commit()
    db.refresh(meta)
    return meta
