from pydantic import BaseModel
from datetime import datetime
from typing import Any


class MetadatosUpsert(BaseModel):
    """PUT/POST: body es el JSON libre de metadatos."""
    data: dict[str, Any]


class MetadatosOut(BaseModel):
    id: int
    project_id: int
    data: dict[str, Any]
    updated_at: datetime

    model_config = {"from_attributes": True}
