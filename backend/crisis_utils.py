import json

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from models.crisis import Crisis
from models.pipeline_result import PipelineResult
from models.response_tracking import ResponseTracking
from pipeline import aggregate_results
from transform import parse_flow_result


def parse_json_list(raw: str) -> list[str]:
    try:
        parsed = json.loads(raw or "[]")
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except json.JSONDecodeError:
        pass
    return [item.strip() for item in (raw or "").split(",") if item.strip()]


def parse_json_object(raw: str) -> dict:
    try:
        parsed = json.loads(raw or "{}")
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        return {}


def get_crisis_or_404(db: Session, crisis_id: str) -> Crisis:
    crisis = db.scalars(
        select(Crisis)
        .options(
            selectinload(Crisis.community_profiles),
            selectinload(Crisis.responses).selectinload(ResponseTracking.organization),
            selectinload(Crisis.gap_alerts),
        )
        .where(Crisis.id == crisis_id)
    ).first()
    if not crisis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crisis not found")
    return crisis


def get_aggregated_pipeline_result(db: Session, crisis_id: str) -> dict:
    records = db.scalars(
        select(PipelineResult)
        .where(PipelineResult.crisis_id == crisis_id)
        .order_by(PipelineResult.created_at.asc())
    ).all()
    results = []
    for record in records:
        try:
            parsed = json.loads(record.raw_result)
            if isinstance(parsed, dict):
                results.append(parse_flow_result(parsed))
        except json.JSONDecodeError:
            continue
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No stored pipeline results found for crisis",
        )
    return aggregate_results(results)


def build_gap_status(crisis: Crisis, aggregated: dict | None = None) -> dict:
    profile = crisis.community_profiles[0] if crisis.community_profiles else None
    if profile:
        top_needs = parse_json_list(profile.top_needs)
    else:
        aggregated_top_needs = (aggregated or {}).get("top_needs", [])
        if isinstance(aggregated_top_needs, list):
            top_needs = [str(item).strip() for item in aggregated_top_needs if str(item).strip()]
        elif isinstance(aggregated_top_needs, str):
            top_needs = parse_json_list(aggregated_top_needs)
        else:
            top_needs = []

    confirmed_needs: set[str] = set()
    for response in crisis.responses:
        if response.status == "response_confirmed":
            confirmed_needs.update(parse_json_list(response.needs_covered))

    unmet_needs = [need for need in top_needs if need not in confirmed_needs]
    gap_detected = len(unmet_needs) > 0

    if gap_detected:
        location = crisis.location
        return {
            "gap_detected": True,
            "alert_status": (aggregated or {}).get("alert_status", "gap_flagged"),
            "alert_message": (
                (aggregated or {}).get("alert_message")
                or f"Critical needs remain uncovered for {location}: {', '.join(unmet_needs)}."
            ),
            "escalation_recommendation": (
                (aggregated or {}).get("escalation_recommendation")
                or "Escalate to additional bilingual and mobility-support partners immediately."
            ),
            "escalation_org": (aggregated or {}).get("escalation_org", ""),
            "unmet_needs": unmet_needs,
        }

    return {
        "gap_detected": False,
        "alert_status": "all_clear",
        "alert_message": "All currently identified critical needs have confirmed coverage.",
        "escalation_recommendation": "Continue monitoring partner confirmations and community updates.",
        "escalation_org": (aggregated or {}).get("escalation_org", ""),
        "unmet_needs": [],
    }
