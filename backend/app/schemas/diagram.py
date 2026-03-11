from typing import Any, Optional
from pydantic import BaseModel


class DiagramSave(BaseModel):
    data: Any  # arbitrary JSON — nodes, connections, etc.


class DiagramOut(BaseModel):
    id: int
    project_id: int
    type: str
    name: str
    data: Any
    updated_at: str

    model_config = {"from_attributes": True}
