from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Enum, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Requirement(Base):
    __tablename__ = "requirements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    type: Mapped[str] = mapped_column(
        Enum("funcional", "no-funcional", "tecnico", "negocio", name="req_type"),
        default="funcional",
    )
    priority: Mapped[str] = mapped_column(
        Enum("alta", "media", "baja", name="req_priority"),
        default="media",
    )
    status: Mapped[str] = mapped_column(
        Enum("borrador", "en-revision", "aprobado", "rechazado", "implementado", name="req_status"),
        default="borrador",
    )
    acceptance_criteria: Mapped[list | None] = mapped_column(JSON, default=None)
    dependencies: Mapped[list | None] = mapped_column(JSON, default=None)
    comments: Mapped[list | None] = mapped_column(JSON, default=None)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="requirements")
