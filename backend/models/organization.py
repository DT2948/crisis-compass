import uuid

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    services: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    languages: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    coverage_areas: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    capacity: Mapped[str] = mapped_column(String, nullable=False)

    responses = relationship("ResponseTracking", back_populates="organization")
