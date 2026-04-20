import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models.crisis import Crisis
from models.response_tracking import ResponseTracking
from schemas.crisis import (
    CommunityProfileResponse,
    CrisisDetailResponse,
    CrisisListResponse,
    CrisisMapPoint,
    CrisisSummaryResponse,
    GapAlertResponse,
    OrganizationResponse,
    ResponseTrackingResponse,
)


router = APIRouter(prefix="/crisis", tags=["crisis"])

LOCATION_COORDINATES = {
    "Eastside District, Pennsylvania": CrisisMapPoint(latitude=40.4412, longitude=-79.9906),
    "North Ridge County, Pennsylvania": CrisisMapPoint(latitude=41.2033, longitude=-77.1945),
}

RESPONSE_STATE_ORDER = [
    "gap_flagged",
    "response_confirmed",
    "ping_sent",
    "needs_identified",
]


def parse_json_list(raw: str) -> list[str]:
    try:
        parsed = json.loads(raw or "[]")
    except json.JSONDecodeError:
        return []
    return [item for item in parsed if isinstance(item, str)]


def determine_response_state(crisis: Crisis) -> str:
    statuses = {response.status for response in crisis.responses}
    if crisis.gap_alerts:
        statuses.add("gap_flagged")
    for state in RESPONSE_STATE_ORDER:
        if state in statuses:
            return state
    return "needs_identified"


def serialize_crisis_summary(crisis: Crisis) -> CrisisSummaryResponse:
    return CrisisSummaryResponse(
        id=crisis.id,
        alert_text=crisis.alert_text,
        crisis_type=crisis.crisis_type,
        severity=crisis.severity,
        location=crisis.location,
        affected_population=crisis.affected_population,
        risk_flags=parse_json_list(crisis.risk_flags),
        created_at=crisis.created_at,
        response_state=determine_response_state(crisis),
        coordinates=LOCATION_COORDINATES.get(
            crisis.location,
            CrisisMapPoint(latitude=40.9, longitude=-77.8),
        ),
    )


def serialize_crisis_detail(crisis: Crisis) -> CrisisDetailResponse:
    profile = crisis.community_profiles[0] if crisis.community_profiles else None
    summary = serialize_crisis_summary(crisis)
    return CrisisDetailResponse(
        **summary.model_dump(),
        community_profile=(
            CommunityProfileResponse(
                id=profile.id,
                crisis_id=profile.crisis_id,
                location=profile.location,
                vulnerability_score=profile.vulnerability_score,
                elderly_pct=profile.elderly_pct,
                spanish_speaking_pct=profile.spanish_speaking_pct,
                low_income_pct=profile.low_income_pct,
                mobility_limited_pct=profile.mobility_limited_pct,
                top_needs=parse_json_list(profile.top_needs),
            )
            if profile
            else None
        ),
        responses=[
            ResponseTrackingResponse(
                id=response.id,
                crisis_id=response.crisis_id,
                org_id=response.org_id,
                needs_covered=parse_json_list(response.needs_covered),
                status=response.status,
                pinged_at=response.pinged_at,
                confirmed_at=response.confirmed_at,
                organization=OrganizationResponse(
                    id=response.organization.id,
                    name=response.organization.name,
                    services=parse_json_list(response.organization.services),
                    languages=parse_json_list(response.organization.languages),
                    coverage_areas=parse_json_list(response.organization.coverage_areas),
                    capacity=response.organization.capacity,
                ),
            )
            for response in crisis.responses
        ],
        gap_alerts=[
            GapAlertResponse(
                id=alert.id,
                crisis_id=alert.crisis_id,
                unmet_needs=parse_json_list(alert.unmet_needs),
                alert_message=alert.alert_message,
                escalation_recommendation=alert.escalation_recommendation,
                fired_at=alert.fired_at,
            )
            for alert in crisis.gap_alerts
        ],
    )


def crisis_query():
    return (
        select(Crisis)
        .options(
            selectinload(Crisis.community_profiles),
            selectinload(Crisis.responses).selectinload(ResponseTracking.organization),
            selectinload(Crisis.gap_alerts),
        )
        .order_by(Crisis.created_at.desc())
    )


@router.get("/active", response_model=CrisisListResponse)
def list_active_crises(db: Session = Depends(get_db)) -> CrisisListResponse:
    crises = db.scalars(crisis_query()).all()
    items = [serialize_crisis_detail(crisis) for crisis in crises]
    return CrisisListResponse(total=len(items), items=items)


@router.get("/{crisis_id}", response_model=CrisisDetailResponse)
def get_crisis(crisis_id: str, db: Session = Depends(get_db)) -> CrisisDetailResponse:
    crisis = db.scalars(crisis_query().where(Crisis.id == crisis_id)).first()
    if not crisis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crisis not found")
    return serialize_crisis_detail(crisis)
