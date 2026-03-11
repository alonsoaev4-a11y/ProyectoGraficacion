"""
Generated docs router.

GET  /api/projects/{project_id}/generated-docs        → list docs
PUT  /api/projects/{project_id}/generated-docs        → bulk replace all docs
GET  /api/projects/{project_id}/generated-docs/{id}   → single doc (full content)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.generation import GeneratedDoc
from ..schemas.generation import GeneratedDocsBulkSave, GeneratedDocOut

router = APIRouter(prefix="/api/projects/{project_id}/generated-docs", tags=["generated-docs"])

VALID_LAYERS = {"bd", "backend", "frontend", "contexto"}


def get_project_or_404(project_id: int, current_user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
        Project.status != "deleted",
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project


@router.get("", response_model=list[GeneratedDocOut])
def list_docs(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    docs = db.query(GeneratedDoc).filter(
        GeneratedDoc.project_id == project_id
    ).order_by(GeneratedDoc.id).all()
    return [GeneratedDocOut(
        id=d.id, project_id=d.project_id, filename=d.filename,
        title=d.title, layer=d.layer, content=d.content,
        generated_at=str(d.generated_at),
    ) for d in docs]


@router.put("", response_model=list[GeneratedDocOut])
def save_docs(
    project_id: int,
    body: GeneratedDocsBulkSave,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)

    # Delete existing
    db.query(GeneratedDoc).filter(GeneratedDoc.project_id == project_id).delete()
    db.flush()

    new_docs = []
    for doc in body.docs:
        layer = doc.layer if doc.layer in VALID_LAYERS else "contexto"
        d = GeneratedDoc(
            project_id=project_id,
            filename=doc.filename,
            title=doc.title,
            layer=layer,
            content=doc.content,
        )
        db.add(d)
        new_docs.append(d)

    db.commit()
    for d in new_docs:
        db.refresh(d)

    return [GeneratedDocOut(
        id=d.id, project_id=d.project_id, filename=d.filename,
        title=d.title, layer=d.layer, content=d.content,
        generated_at=str(d.generated_at),
    ) for d in new_docs]
