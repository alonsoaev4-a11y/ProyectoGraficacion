from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


# ── UseCaseOut ─────────────────────────────────────────────────────────────────
# The frontend UseCase type is complex (actors, steps, businessRules, etc.)
# We store:
#   - title, description, preconditions, postconditions as structured columns
#   - everything else (code, type, priority, status, actors, businessRules,
#     exceptions, steps, alternativeFlows) in the `triggers` JSON column
#     under key "snapshot"

class UseCaseCreate(BaseModel):
    # Required
    title: str
    # Optional structured fields
    description: Optional[str] = None
    preconditions: Optional[list] = None
    postconditions: Optional[list] = None
    # Full frontend snapshot stored in triggers->snapshot
    snapshot: Optional[Any] = None


class UseCaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    preconditions: Optional[list] = None
    postconditions: Optional[list] = None
    snapshot: Optional[Any] = None


class UseCaseOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    preconditions: Optional[list] = None
    postconditions: Optional[list] = None
    # The full frontend UseCase object (reconstructed from snapshot)
    snapshot: Optional[Any] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
