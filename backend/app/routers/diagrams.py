"""
Diagrams router.

GET  /api/projects/{project_id}/diagrams/{diagram_type}  → load diagram data
PUT  /api/projects/{project_id}/diagrams/{diagram_type}  → upsert diagram data

diagram_type: "flujo" | "casos-uso" | "er"  (extensible)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.diagram import Diagram
from ..schemas.diagram import DiagramSave, DiagramOut

router = APIRouter(prefix="/api/projects/{project_id}/diagrams", tags=["diagrams"])


def get_project_or_404(project_id: int, current_user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
        Project.status != "deleted",
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project


@router.get("/{diagram_type}", response_model=DiagramOut)
def get_diagram(
    project_id: int,
    diagram_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    diagram = db.query(Diagram).filter(
        Diagram.project_id == project_id,
        Diagram.type == diagram_type,
    ).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagrama no encontrado")
    return DiagramOut(
        id=diagram.id,
        project_id=diagram.project_id,
        type=diagram.type,
        name=diagram.name,
        data=diagram.data,
        updated_at=str(diagram.updated_at),
    )


@router.put("/{diagram_type}", response_model=DiagramOut)
def save_diagram(
    project_id: int,
    diagram_type: str,
    body: DiagramSave,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    diagram = db.query(Diagram).filter(
        Diagram.project_id == project_id,
        Diagram.type == diagram_type,
    ).first()

    if diagram:
        diagram.data = body.data
    else:
        diagram = Diagram(
            project_id=project_id,
            type=diagram_type,
            name=diagram_type,
            data=body.data,
        )
        db.add(diagram)

    db.commit()
    db.refresh(diagram)
    return DiagramOut(
        id=diagram.id,
        project_id=diagram.project_id,
        type=diagram.type,
        name=diagram.name,
        data=diagram.data,
        updated_at=str(diagram.updated_at),
    )
