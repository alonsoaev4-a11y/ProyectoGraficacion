from typing import Optional
from pydantic import BaseModel


class GeneratedDocCreate(BaseModel):
    filename: str
    title: str
    layer: str   # bd | backend | frontend | contexto
    content: str


class GeneratedDocOut(BaseModel):
    id: int
    project_id: int
    filename: str
    title: str
    layer: str
    content: str
    generated_at: str

    model_config = {"from_attributes": True}


class GeneratedDocsBulkSave(BaseModel):
    docs: list[GeneratedDocCreate] = []
