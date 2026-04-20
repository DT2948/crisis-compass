import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class GapAlert(Base):
    __tablename__ = "gap_alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crisis_id: Mapped[str] = mapped_column(String, ForeignKey("crises.id"), nullable=False, index=True)
    unmet_needs: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    alert_message: Mapped[str] = mapped_column(Text, nullable=False)
    escalation_recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    fired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)

    crisis = relationship("Crisis", back_populates="gap_alerts")
