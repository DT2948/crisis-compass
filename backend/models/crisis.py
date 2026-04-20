import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Crisis(Base):
    __tablename__ = "crises"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_text: Mapped[str] = mapped_column(Text, nullable=False)
    crisis_type: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    affected_population: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_flags: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)

    community_profiles = relationship(
        "CommunityProfile",
        back_populates="crisis",
        cascade="all, delete-orphan",
    )
    responses = relationship(
        "ResponseTracking",
        back_populates="crisis",
        cascade="all, delete-orphan",
    )
    gap_alerts = relationship(
        "GapAlert",
        back_populates="crisis",
        cascade="all, delete-orphan",
    )
