from datetime import datetime

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class GeneratedDoc(Base):
    __tablename__ = "generated_docs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    layer: Mapped[str] = mapped_column(Enum("bd", "backend", "frontend", "contexto", name="doc_layer"), nullable=False)
    content: Mapped[str] = mapped_column(Text(length=4294967295), nullable=False)  # LONGTEXT
    generated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="generated_docs")
