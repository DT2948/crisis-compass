import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class CommunityProfile(Base):
    __tablename__ = "community_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crisis_id: Mapped[str] = mapped_column(String, ForeignKey("crises.id"), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String, nullable=False)
    vulnerability_score: Mapped[int] = mapped_column(Integer, nullable=False)
    elderly_pct: Mapped[float] = mapped_column(Float, nullable=False)
    spanish_speaking_pct: Mapped[float] = mapped_column(Float, nullable=False)
    low_income_pct: Mapped[float] = mapped_column(Float, nullable=False)
    mobility_limited_pct: Mapped[float] = mapped_column(Float, nullable=False)
    top_needs: Mapped[str] = mapped_column(Text, nullable=False, default="[]")

    crisis = relationship("Crisis", back_populates="community_profiles")
