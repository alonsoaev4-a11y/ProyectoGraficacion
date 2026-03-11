from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.requirement import Requirement
from ..schemas.requirement import RequirementCreate, RequirementUpdate, RequirementOut

router = APIRouter(prefix="/api/projects/{project_id}/requirements", tags=["requirements"])


# ── Guard: verify project belongs to current user ──────────────────────────────

def get_project_or_404(project_id: int, current_user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
        Project.status != "deleted",
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project


def _code(order_index: int) -> str:
    return f"REQ-{str(order_index).zfill(3)}"


# ── List ───────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[RequirementOut])
def list_requirements(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    reqs = (
        db.query(Requirement)
        .filter(Requirement.project_id == project_id)
        .order_by(Requirement.order_index, Requirement.id)
        .all()
    )
    # Attach computed code field
    for i, r in enumerate(reqs, start=1):
        r.code = _code(r.order_index if r.order_index else i)
    return reqs


# ── Create ─────────────────────────────────────────────────────────────────────

@router.post("", response_model=RequirementOut, status_code=status.HTTP_201_CREATED)
def create_requirement(
    project_id: int,
    body: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)

    # Auto-assign order_index = next available
    count = db.query(Requirement).filter(Requirement.project_id == project_id).count()
    order_index = body.order_index if body.order_index else count + 1

    req = Requirement(
        project_id=project_id,
        title=body.title,
        description=body.description,
        type=body.type,
        priority=body.priority,
        status=body.status,
        acceptance_criteria=body.acceptance_criteria or [],
        dependencies=body.dependencies or [],
        comments=[c.model_dump() for c in body.comments] if body.comments else [],
        order_index=order_index,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    req.code = _code(req.order_index)
    return req


# ── Get one ────────────────────────────────────────────────────────────────────

@router.get("/{req_id}", response_model=RequirementOut)
def get_requirement(
    project_id: int,
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    req = db.query(Requirement).filter(
        Requirement.id == req_id,
        Requirement.project_id == project_id,
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisito no encontrado")
    req.code = _code(req.order_index if req.order_index else req_id)
    return req


# ── Update ─────────────────────────────────────────────────────────────────────

@router.put("/{req_id}", response_model=RequirementOut)
def update_requirement(
    project_id: int,
    req_id: int,
    body: RequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    req = db.query(Requirement).filter(
        Requirement.id == req_id,
        Requirement.project_id == project_id,
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisito no encontrado")

    data = body.model_dump(exclude_unset=True)
    if "comments" in data and data["comments"] is not None:
        data["comments"] = [c.model_dump() if hasattr(c, "model_dump") else c for c in (body.comments or [])]
    for field, value in data.items():
        setattr(req, field, value)

    db.commit()
    db.refresh(req)
    req.code = _code(req.order_index if req.order_index else req_id)
    return req


# ── Delete ─────────────────────────────────────────────────────────────────────

@router.delete("/{req_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(
    project_id: int,
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    req = db.query(Requirement).filter(
        Requirement.id == req_id,
        Requirement.project_id == project_id,
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requisito no encontrado")
    db.delete(req)
    db.commit()
