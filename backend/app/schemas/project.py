from pydantic import BaseModel
from datetime import datetime
from typing import Any


# ── Requests ──────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    settings: dict[str, Any] | None = None   # type, template, stack, language…


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    settings: dict[str, Any] | None = None


# ── Responses ─────────────────────────────────────────────
class ProjectOut(BaseModel):
    id: int
    name: str
    description: str | None
    owner_id: int
    status: str
    settings: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectSummary(BaseModel):
    """Versión ligera para listar proyectos en el dashboard."""
    id: int
    name: str
    description: str | None
    status: str
    settings: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
