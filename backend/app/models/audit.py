from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), default=None)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    entity: Mapped[str | None] = mapped_column(String(100), default=None)
    type: Mapped[str] = mapped_column(Enum("system", "user", "database", "business", name="log_type"), default="system")
    status: Mapped[str] = mapped_column(Enum("success", "warning", "error", "info", name="log_status"), default="success")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)

    # Relationships
    project = relationship("Project", back_populates="audit_logs")
    user = relationship("User")
