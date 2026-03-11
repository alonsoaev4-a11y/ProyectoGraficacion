from datetime import datetime

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Enum, SmallInteger, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class DataTable(Base):
    __tablename__ = "data_tables"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    position_x: Mapped[float] = mapped_column(Float, default=100)
    position_y: Mapped[float] = mapped_column(Float, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="data_tables")
    columns = relationship("DataColumn", back_populates="table", cascade="all, delete-orphan", order_by="DataColumn.order_index", foreign_keys="DataColumn.table_id")


class DataColumn(Base):
    __tablename__ = "data_columns"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    table_id: Mapped[int] = mapped_column(Integer, ForeignKey("data_tables.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False, default="VARCHAR(255)")
    is_pk: Mapped[int] = mapped_column(SmallInteger, default=0)
    is_fk: Mapped[int] = mapped_column(SmallInteger, default=0)
    is_nullable: Mapped[int] = mapped_column(SmallInteger, default=1)
    default_value: Mapped[str | None] = mapped_column(String(255), default=None)
    ref_table_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("data_tables.id", ondelete="SET NULL"), default=None)
    ref_column_id: Mapped[int | None] = mapped_column(Integer, default=None)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    table = relationship("DataTable", back_populates="columns", foreign_keys=[table_id])
    ref_table = relationship("DataTable", foreign_keys=[ref_table_id])


class DataRelationship(Base):
    __tablename__ = "data_relationships"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    from_table_id: Mapped[int] = mapped_column(Integer, ForeignKey("data_tables.id", ondelete="CASCADE"), nullable=False)
    to_table_id: Mapped[int] = mapped_column(Integer, ForeignKey("data_tables.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(Enum("1:1", "1:N", "N:M", name="rel_type"), default="1:N")

    # Relationships
    project = relationship("Project", back_populates="data_relationships")
    from_table = relationship("DataTable", foreign_keys=[from_table_id])
    to_table = relationship("DataTable", foreign_keys=[to_table_id])
