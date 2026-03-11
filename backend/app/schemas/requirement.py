from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Shared ─────────────────────────────────────────────────────────────────────

class CommentSchema(BaseModel):
    id: str
    author: str
    text: str
    date: str


class RequirementBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str = "funcional"          # funcional | no-funcional | tecnico | negocio
    priority: str = "media"          # alta | media | baja
    status: str = "borrador"         # borrador | en-revision | aprobado | rechazado | implementado
    acceptance_criteria: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    comments: Optional[List[CommentSchema]] = None
    order_index: int = 0


# ── Create ─────────────────────────────────────────────────────────────────────

class RequirementCreate(RequirementBase):
    pass


# ── Update ─────────────────────────────────────────────────────────────────────

class RequirementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    acceptance_criteria: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    comments: Optional[List[CommentSchema]] = None
    order_index: Optional[int] = None


# ── Out ────────────────────────────────────────────────────────────────────────

class RequirementOut(RequirementBase):
    id: int
    project_id: int
    code: str                        # computed: REQ-001, REQ-002…
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
