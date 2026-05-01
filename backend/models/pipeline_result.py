import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PipelineResult(Base):
    __tablename__ = "pipeline_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crisis_id: Mapped[str] = mapped_column(String, ForeignKey("crises.id"), nullable=False, index=True)
    org_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    raw_result: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)

    crisis = relationship("Crisis")
