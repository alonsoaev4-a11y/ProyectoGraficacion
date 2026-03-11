"""Pydantic schemas for AuditLog."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: int
    project_id: int
    user_id: Optional[int]
    action: str
    description: Optional[str]
    entity: Optional[str]
    type: str
    status: str
    created_at: datetime

    # Denormalized user info (filled by router)
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    user_avatar: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogCreate(BaseModel):
    action: str
    description: Optional[str] = None
    entity: Optional[str] = None
    type: str = "system"
    status: str = "success"


class AuditLogPage(BaseModel):
    items: list[AuditLogOut]
    total: int
    page: int
    limit: int
    pages: int
