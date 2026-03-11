"""CRUD endpoints for audit logs with pagination and CSV export."""

import csv
import io
import math

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.audit import AuditLog
from ..models.user import User
from ..schemas.audit import AuditLogCreate, AuditLogOut, AuditLogPage

router = APIRouter(prefix="/api/projects/{project_id}/audit-logs", tags=["audit"])


def _to_out(log: AuditLog) -> AuditLogOut:
    user_name = "Sistema"
    user_role = "System"
    user_avatar = "https://ui-avatars.com/api/?name=Sistema&background=64748b&color=fff"
    if log.user:
        user_name = log.user.name
        user_role = "Admin"
        user_avatar = f"https://ui-avatars.com/api/?name={log.user.name.replace(' ', '+')}&background=6366f1&color=fff"
    return AuditLogOut(
        id=log.id,
        project_id=log.project_id,
        user_id=log.user_id,
        action=log.action,
        description=log.description,
        entity=log.entity,
        type=log.type,
        status=log.status,
        created_at=log.created_at,
        user_name=user_name,
        user_role=user_role,
        user_avatar=user_avatar,
    )


@router.get("", response_model=AuditLogPage)
def list_audit_logs(
    project_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base = db.query(AuditLog).filter(AuditLog.project_id == project_id)
    total = base.count()
    pages = max(1, math.ceil(total / limit))
    items = (
        base.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return AuditLogPage(
        items=[_to_out(l) for l in items],
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.post("", response_model=AuditLogOut, status_code=201)
def create_audit_log(
    project_id: int,
    data: AuditLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = AuditLog(
        project_id=project_id,
        user_id=current_user.id,
        action=data.action,
        description=data.description,
        entity=data.entity,
        type=data.type,
        status=data.status,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return _to_out(log)


@router.get("/export.csv")
def export_audit_csv(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.project_id == project_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "fecha", "usuario", "accion", "descripcion", "entidad", "tipo", "estado"])
    for log in logs:
        user_name = log.user.name if log.user else "Sistema"
        writer.writerow([
            log.id,
            log.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            user_name,
            log.action,
            log.description or "",
            log.entity or "",
            log.type,
            log.status,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=audit_project_{project_id}.csv"},
    )
