from pydantic import BaseModel, EmailStr
from datetime import datetime


# ── Request ───────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


# ── Response ──────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
