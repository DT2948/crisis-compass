import uuid
import json

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

    def services_list(self) -> list[str]:
        try:
            parsed = json.loads(self.services)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except Exception:
            pass
        return [item.strip() for item in self.services.split(",") if item.strip()] if self.services else []

    def languages_list(self) -> list[str]:
        try:
            parsed = json.loads(self.languages)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except Exception:
            pass
        return [item.strip() for item in self.languages.split(",") if item.strip()] if self.languages else []

    def coverage_areas_list(self) -> list[str]:
        try:
            parsed = json.loads(self.coverage_areas)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except Exception:
            pass
        return [item.strip() for item in self.coverage_areas.split(",") if item.strip()] if self.coverage_areas else []
