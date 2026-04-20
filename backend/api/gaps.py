import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models.gap_alert import GapAlert
from schemas.crisis import GapAlertResponse


router = APIRouter(prefix="/gaps", tags=["gaps"])


def parse_json_list(raw: str) -> list[str]:
    try:
        parsed = json.loads(raw or "[]")
    except json.JSONDecodeError:
        return []
    return [item for item in parsed if isinstance(item, str)]


@router.get("/active", response_model=list[GapAlertResponse])
def list_active_gaps(db: Session = Depends(get_db)) -> list[GapAlertResponse]:
    alerts = db.scalars(
        select(GapAlert)
        .options(selectinload(GapAlert.crisis))
        .order_by(GapAlert.fired_at.desc())
    ).all()
    return [
        GapAlertResponse(
            id=alert.id,
            crisis_id=alert.crisis_id,
            unmet_needs=parse_json_list(alert.unmet_needs),
            alert_message=alert.alert_message,
            escalation_recommendation=alert.escalation_recommendation,
            fired_at=alert.fired_at,
        )
        for alert in alerts
    ]
