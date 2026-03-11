"""CRUD endpoints for project members."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.project import Project, ProjectMember
from ..schemas.member import MemberOut, MemberCreate, MemberUpdate
from ..services.auth import get_user_by_email

router = APIRouter(prefix="/api/projects/{project_id}/members", tags=["members"])

VALID_ROLES = {"owner", "editor", "viewer"}


def _get_project_or_404(project_id: int, db: Session, current_user: User) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    # Only owner or members can access
    if project.owner_id != current_user.id:
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Sin acceso")
    return project


def _member_to_out(member: ProjectMember) -> MemberOut:
    return MemberOut(
        id=member.id,
        project_id=member.project_id,
        user_id=member.user_id,
        role=member.role,
        name=member.user.name,
        email=member.user.email,
    )


@router.get("", response_model=list[MemberOut])
def list_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_project_or_404(project_id, db, current_user)
    members = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id)
        .all()
    )
    return [_member_to_out(m) for m in members]


@router.post("", response_model=MemberOut, status_code=201)
def add_member(
    project_id: int,
    data: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(project_id, db, current_user)
    # Only owner can manage members
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el owner puede gestionar miembros")

    role = data.role.lower()
    if role not in VALID_ROLES:
        raise HTTPException(status_code=422, detail=f"Rol inválido. Opciones: {VALID_ROLES}")

    invited = get_user_by_email(db, data.email)
    if not invited:
        raise HTTPException(status_code=404, detail=f"Usuario '{data.email}' no encontrado")

    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == invited.id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="El usuario ya es miembro del proyecto")

    member = ProjectMember(project_id=project_id, user_id=invited.id, role=role)
    db.add(member)
    db.commit()
    db.refresh(member)
    return _member_to_out(member)


@router.put("/{member_id}", response_model=MemberOut)
def update_member_role(
    project_id: int,
    member_id: int,
    data: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(project_id, db, current_user)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el owner puede cambiar roles")

    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")

    role = data.role.lower()
    if role not in VALID_ROLES:
        raise HTTPException(status_code=422, detail=f"Rol inválido. Opciones: {VALID_ROLES}")

    member.role = role
    db.commit()
    db.refresh(member)
    return _member_to_out(member)


@router.delete("/{member_id}", status_code=204)
def remove_member(
    project_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(project_id, db, current_user)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el owner puede eliminar miembros")

    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")

    db.delete(member)
    db.commit()
