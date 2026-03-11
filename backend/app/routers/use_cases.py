from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.use_case import UseCase
from ..schemas.use_case import UseCaseCreate, UseCaseUpdate, UseCaseOut

router = APIRouter(prefix="/api/projects/{project_id}/use-cases", tags=["use-cases"])


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

def _to_out(uc: UseCase) -> UseCaseOut:
    """Convert ORM UseCase to UseCaseOut, extracting snapshot from triggers."""
    snapshot = None
    if uc.triggers and isinstance(uc.triggers, dict):
        snapshot = uc.triggers.get("snapshot")
    return UseCaseOut(
        id=uc.id,
        project_id=uc.project_id,
        title=uc.title,
        description=uc.description,
        preconditions=uc.preconditions,
        postconditions=uc.postconditions,
        snapshot=snapshot,
        created_at=uc.created_at,
        updated_at=uc.updated_at,
    )


# ── List ───────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[UseCaseOut])
def list_use_cases(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    ucs = (
        db.query(UseCase)
        .filter(UseCase.project_id == project_id)
        .order_by(UseCase.id)
        .all()
    )
    return [_to_out(uc) for uc in ucs]


# ── Create ─────────────────────────────────────────────────────────────────────

@router.post("", response_model=UseCaseOut, status_code=status.HTTP_201_CREATED)
def create_use_case(
    project_id: int,
    body: UseCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)

    uc = UseCase(
        project_id=project_id,
        title=body.title,
        description=body.description,
        preconditions=body.preconditions or [],
        postconditions=body.postconditions or [],
        triggers={"snapshot": body.snapshot} if body.snapshot is not None else None,
    )
    db.add(uc)
    db.commit()
    db.refresh(uc)
    return _to_out(uc)


# ── Get one ────────────────────────────────────────────────────────────────────

@router.get("/{uc_id}", response_model=UseCaseOut)
def get_use_case(
    project_id: int,
    uc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    uc = db.query(UseCase).filter(
        UseCase.id == uc_id,
        UseCase.project_id == project_id,
    ).first()
    if not uc:
        raise HTTPException(status_code=404, detail="Caso de uso no encontrado")
    return _to_out(uc)


# ── Update ─────────────────────────────────────────────────────────────────────

@router.put("/{uc_id}", response_model=UseCaseOut)
def update_use_case(
    project_id: int,
    uc_id: int,
    body: UseCaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    uc = db.query(UseCase).filter(
        UseCase.id == uc_id,
        UseCase.project_id == project_id,
    ).first()
    if not uc:
        raise HTTPException(status_code=404, detail="Caso de uso no encontrado")

    data = body.model_dump(exclude_unset=True)

    # Handle snapshot separately — store in triggers JSON
    if "snapshot" in data:
        snapshot = data.pop("snapshot")
        existing = uc.triggers if isinstance(uc.triggers, dict) else {}
        uc.triggers = {**existing, "snapshot": snapshot}

    for field, value in data.items():
        setattr(uc, field, value)

    db.commit()
    db.refresh(uc)
    return _to_out(uc)


# ── Delete ─────────────────────────────────────────────────────────────────────

@router.delete("/{uc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_use_case(
    project_id: int,
    uc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user, db)
    uc = db.query(UseCase).filter(
        UseCase.id == uc_id,
        UseCase.project_id == project_id,
    ).first()
    if not uc:
        raise HTTPException(status_code=404, detail="Caso de uso no encontrado")
    db.delete(uc)
    db.commit()
