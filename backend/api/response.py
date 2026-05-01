import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from crisis_utils import build_gap_status, get_aggregated_pipeline_result, get_crisis_or_404
from database import get_db
from models.gap_alert import GapAlert
from models.response_tracking import ResponseTracking
from schemas.crisis import GapStatusResponse, ResponseConfirmationRequest, SimulateElapsedRequest


router = APIRouter(prefix="/response", tags=["response"])


@router.post("/confirm")
def confirm_response(
    request: ResponseConfirmationRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    response = db.scalars(
        select(ResponseTracking).where(
            ResponseTracking.crisis_id == request.crisis_id,
            ResponseTracking.org_id == request.org_id,
        )
    ).first()
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response tracking record not found")

    response.needs_covered = json.dumps(request.needs_covered)
    response.status = "response_confirmed"
    response.confirmed_at = datetime.now(timezone.utc)
    if response.pinged_at is None:
        response.pinged_at = response.confirmed_at

    db.add(response)
    db.commit()

    return {"status": "response_confirmed"}


@router.post("/simulate-elapsed", response_model=GapStatusResponse)
def simulate_elapsed(
    request: SimulateElapsedRequest,
    db: Session = Depends(get_db),
) -> GapStatusResponse:
    crisis = get_crisis_or_404(db, request.crisis_id)
    try:
        aggregated = get_aggregated_pipeline_result(db, request.crisis_id)
    except HTTPException:
        aggregated = {}

    gap_status = build_gap_status(crisis, aggregated)

    sorted_alerts = sorted(crisis.gap_alerts, key=lambda alert: alert.fired_at, reverse=True)
    latest_alert = next(iter(sorted_alerts), None)
    if gap_status["gap_detected"]:
        if latest_alert is None:
            latest_alert = GapAlert(crisis_id=crisis.id)
        latest_alert.unmet_needs = json.dumps(gap_status["unmet_needs"])
        latest_alert.alert_message = gap_status["alert_message"]
        latest_alert.escalation_recommendation = gap_status["escalation_recommendation"]
        latest_alert.fired_at = datetime.now(timezone.utc)
        db.add(latest_alert)

        for response in crisis.responses:
            if response.status in {"needs_identified", "ping_sent"}:
                response.status = "gap_flagged"
                db.add(response)
    else:
        for response in crisis.responses:
            if response.status == "gap_flagged":
                response.status = "ping_sent" if response.confirmed_at is None else "response_confirmed"
                db.add(response)
        for alert in sorted_alerts:
            db.delete(alert)

    db.commit()
    return GapStatusResponse(**gap_status)
