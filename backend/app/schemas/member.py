"""Schemas for project members."""
from pydantic import BaseModel


class MemberOut(BaseModel):
    id: int
    project_id: int
    user_id: int
    role: str
    # User info joined
    name: str
    email: str

    class Config:
        from_attributes = True


class MemberCreate(BaseModel):
    email: str
    role: str = "viewer"


class MemberUpdate(BaseModel):
    role: str
