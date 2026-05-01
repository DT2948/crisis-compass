import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from crisis_utils import get_aggregated_pipeline_result, get_crisis_or_404
from database import get_db
from models.gap_alert import GapAlert
from models.response_tracking import ResponseTracking
from schemas.crisis import GapStatusResponse, ResponseConfirmationRequest, SimulateElapsedRequest


router = APIRouter(prefix="/response", tags=["response"])

GAP_ALERT_MESSAGE = (
    "Bilingual elder care, medical transport, and evacuation assistance have "
    "no confirmed responders in Eastside District, leaving elderly residents and "
    "non-English speakers at critical risk with floodwaters still rising."
)

GAP_ESCALATION_RECOMMENDATION = (
    "Contact Philadelphia Elder Care Alliance immediately — they are matched but "
    "have not confirmed. Activate mutual aid protocol if no response within 15 minutes."
)

GAP_ESCALATION_ORG = "ORG001 — Philadelphia Elder Care Alliance"


def parse_json_list(raw: str) -> list[str]:
    try:
        parsed = json.loads(raw or "[]")
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except json.JSONDecodeError:
        pass
    return [item.strip() for item in (raw or "").split(",") if item.strip()]


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
    aggregated = get_aggregated_pipeline_result(db, request.crisis_id)

    top_needs_raw = aggregated.get("top_needs", [])
    if isinstance(top_needs_raw, list):
        top_needs = [str(item).strip() for item in top_needs_raw if str(item).strip()]
    elif isinstance(top_needs_raw, str):
        top_needs = parse_json_list(top_needs_raw)
    else:
        top_needs = []

    confirmed_needs: set[str] = set()
    for response in crisis.responses:
        if response.status == "response_confirmed":
            confirmed_needs.update(parse_json_list(response.needs_covered))

    unmet_needs = [need for need in top_needs if need not in confirmed_needs]
    gap_detected = len(unmet_needs) > 0

    sorted_alerts = sorted(crisis.gap_alerts, key=lambda alert: alert.fired_at, reverse=True)
    latest_alert = next(iter(sorted_alerts), None)

    if gap_detected:
        now = datetime.now(timezone.utc)
        if latest_alert is None:
            latest_alert = GapAlert(crisis_id=crisis.id)

        latest_alert.unmet_needs = json.dumps(unmet_needs)
        latest_alert.alert_message = GAP_ALERT_MESSAGE
        latest_alert.escalation_recommendation = GAP_ESCALATION_RECOMMENDATION
        latest_alert.fired_at = now
        db.add(latest_alert)

        for response in crisis.responses:
            if response.status == "ping_sent":
                response.status = "gap_flagged"
                response.pinged_at = now
                db.add(response)
    else:
        for response in crisis.responses:
            if response.status == "gap_flagged":
                response.status = "ping_sent" if response.confirmed_at is None else "response_confirmed"
                db.add(response)
        for alert in sorted_alerts:
            db.delete(alert)

    db.commit()

    return GapStatusResponse(
        gap_detected=gap_detected,
        alert_status="critical_gap" if gap_detected else "all_clear",
        alert_message=GAP_ALERT_MESSAGE if gap_detected else "All currently identified critical needs have confirmed coverage.",
        escalation_recommendation=GAP_ESCALATION_RECOMMENDATION if gap_detected else "Continue monitoring partner confirmations and community updates.",
        escalation_org=GAP_ESCALATION_ORG if gap_detected else "",
        unmet_needs=unmet_needs,
    )
