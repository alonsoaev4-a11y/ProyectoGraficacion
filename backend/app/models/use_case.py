from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class UseCase(Base):
    __tablename__ = "use_cases"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    actor: Mapped[str | None] = mapped_column(String(255), default=None)
    preconditions: Mapped[list | None] = mapped_column(JSON, default=None)
    postconditions: Mapped[list | None] = mapped_column(JSON, default=None)
    triggers: Mapped[dict | list | None] = mapped_column(JSON, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="use_cases")
    steps = relationship("UseCaseStep", back_populates="use_case", cascade="all, delete-orphan", order_by="UseCaseStep.order_index")
    alt_flows = relationship("UseCaseAltFlow", back_populates="use_case", cascade="all, delete-orphan")


class UseCaseStep(Base):
    __tablename__ = "use_case_steps"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    use_case_id: Mapped[int] = mapped_column(Integer, ForeignKey("use_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="USER_ACTION")
    semantics: Mapped[dict | None] = mapped_column(JSON, default=None)

    # Relationships
    use_case = relationship("UseCase", back_populates="steps")


class UseCaseAltFlow(Base):
    __tablename__ = "use_case_alt_flows"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    use_case_id: Mapped[int] = mapped_column(Integer, ForeignKey("use_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    condition: Mapped[str | None] = mapped_column(Text, default=None)
    steps: Mapped[list | None] = mapped_column(JSON, default=None)

    # Relationships
    use_case = relationship("UseCase", back_populates="alt_flows")
