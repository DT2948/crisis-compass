import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.crisis import Crisis
from models.gap_alert import GapAlert
from models.response_tracking import ResponseTracking
from schemas.agents import (
    CommunityNeedsRequest,
    CommunityNeedsResponse,
    CrisisIntakeRequest,
    CrisisIntakeResponse,
    GapDetectionRequest,
    GapDetectionResponse,
    MatchedOrganizationResponse,
    OrgMatchingRequest,
    OrgMatchingResponse,
)


router = APIRouter(prefix="/agents", tags=["agents"])


def parse_json_list(raw: str) -> list[str]:
    try:
        parsed = json.loads(raw or "[]")
    except json.JSONDecodeError:
        return []
    return [item for item in parsed if isinstance(item, str)]


@router.post("/intake", response_model=CrisisIntakeResponse)
def crisis_intake(request: CrisisIntakeRequest) -> CrisisIntakeResponse:
    # WatsonX integration pending
    _ = request
    return CrisisIntakeResponse(
        crisis_type="flood",
        severity="high",
        location="Eastside District, Pennsylvania",
        affected_population=18400,
        risk_flags=["flash_flooding", "elderly_residents", "language_access"],
    )


@router.post("/community-needs", response_model=CommunityNeedsResponse)
def community_needs(request: CommunityNeedsRequest) -> CommunityNeedsResponse:
    # WatsonX integration pending
    _ = request
    return CommunityNeedsResponse(
        vulnerability_score=87,
        demographics={
            "elderly_pct": 24.5,
            "spanish_speaking_pct": 31.0,
            "low_income_pct": 42.0,
            "mobility_limited_pct": 14.0,
        },
        top_needs=[
            "bilingual elder care outreach",
            "flood cleanup kits",
            "temporary shelter transport",
            "prescription continuity",
        ],
    )


@router.post("/org-matching", response_model=OrgMatchingResponse)
def org_matching(request: OrgMatchingRequest) -> OrgMatchingResponse:
    # WatsonX integration pending
    _ = request
    return OrgMatchingResponse(
        organizations=[
            MatchedOrganizationResponse(
                name="Keystone Relief Network",
                match_score=94,
                capabilities_matched=["cleanup kits", "shelter coordination"],
                brief="Regional relief network with bilingual field coordinators and strong local capacity.",
                status="response_confirmed",
            ),
            MatchedOrganizationResponse(
                name="River Valley Health Collaborative",
                match_score=88,
                capabilities_matched=["mobile health", "prescription continuity"],
                brief="Health coalition suited for continuity-of-care outreach and wellness checks.",
                status="ping_sent",
            ),
        ]
    )


@router.post("/gap-detection", response_model=GapDetectionResponse)
def gap_detection(
    request: GapDetectionRequest,
    db: Session = Depends(get_db),
) -> GapDetectionResponse:
    # WatsonX integration pending
    crisis = db.get(Crisis, request.crisis_id)
    if not crisis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crisis not found")

    profile = crisis.community_profiles[0] if crisis.community_profiles else None
    top_needs = parse_json_list(profile.top_needs) if profile else []
    confirmed_needs: set[str] = set()

    for response in crisis.responses:
        if response.status == "response_confirmed":
            confirmed_needs.update(parse_json_list(response.needs_covered))

    unmet_needs = [need for need in top_needs if need not in confirmed_needs]
    gap_detected = len(unmet_needs) > 0

    if gap_detected:
        for response in crisis.responses:
            if response.status in {"needs_identified", "ping_sent"}:
                response.status = "gap_flagged"
                db.add(response)

        alert = GapAlert(
            crisis_id=crisis.id,
            unmet_needs=json.dumps(unmet_needs),
            alert_message=(
                f"Critical needs remain uncovered for {crisis.location}: {', '.join(unmet_needs)}."
            ),
            escalation_recommendation=(
                "Escalate to additional bilingual and mobility-support partners immediately."
            ),
            fired_at=datetime.now(timezone.utc),
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        return GapDetectionResponse(
            gap_detected=True,
            unmet_needs=unmet_needs,
            alert_message=alert.alert_message,
            escalation_recommendation=alert.escalation_recommendation,
        )

    return GapDetectionResponse(
        gap_detected=False,
        unmet_needs=[],
        alert_message="All currently identified critical needs have confirmed coverage.",
        escalation_recommendation="Continue monitoring partner confirmations and community updates.",
    )
