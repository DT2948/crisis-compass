import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.community_profile import CommunityProfile
from models.crisis import Crisis
from models.organization import Organization
from models.pipeline_result import PipelineResult
from models.response_tracking import ResponseTracking


HARDCODED_PIPELINE_RESULT = {
    "unified_alert_text": (
        "A severe flash flood is affecting the Eastside District of Philadelphia, "
        "Pennsylvania, with the Schuylkill River reaching catastrophic flood stage. "
        "Four independent sources confirm rapidly rising water levels. Social media "
        "ground reports indicate conditions are more severe than official estimates "
        "— elderly and non-English speaking residents are already isolated and have "
        "not been reached by responders. Immediate deployment of bilingual elder "
        "care and evacuation assistance is critical."
    ),
    "sources_used": "fema, weather_gov, news, social",
    "source_count": 4,
    "signal_confidence": "high",
    "severity_escalation": "true",
    "escalation_reason": (
        "FEMA reported moderate severity but Weather.gov and social signals indicate "
        "catastrophic conditions. Severity escalated to CRITICAL based on ground "
        "truth signals."
    ),
    "sources": {
        "fema": {
            "raw_text": (
                "FLASH FLOOD EMERGENCY — National Weather Service Philadelphia PA. "
                "The Schuylkill River at Philadelphia has risen to catastrophic "
                "flood stage. Immediate evacuation required for Eastside District. "
                "Affects approximately 42,000 residents including a high "
                "concentration of elderly and non-English speaking populations."
            ),
            "timestamp": "2026-05-01T08:15:00-05:00",
            "credibility": "official",
        },
        "weather_gov": {
            "raw_text": (
                "Weather.gov CATASTROPHIC FLOOD WARNING in effect until further "
                "notice. River levels at 34.2 feet, well above the 28-foot flood "
                "stage. Rainfall totals of 6.8 inches recorded in 12 hours. "
                "Conditions deteriorating. Severity assessed as CATASTROPHIC — "
                "escalated beyond initial FEMA moderate rating."
            ),
            "timestamp": "2026-05-01T08:08:00-05:00",
            "credibility": "weather_service",
        },
        "news": {
            "raw_text": (
                "Philadelphia Inquirer: Eastside District residents trapped as "
                "floodwaters rise rapidly. Emergency services overwhelmed. Elderly "
                "care facilities on Kensington Ave reporting residents unable to "
                "evacuate without assistance. Spanish-language community radio "
                "urging evacuation but many residents unreachable."
            ),
            "timestamp": "2026-05-01T08:31:00-05:00",
            "credibility": "media",
        },
        "social": {
            "raw_text": (
                "Multiple reports of elderly residents stranded on upper floors in "
                "Eastside District. Community members calling for bilingual "
                "emergency assistance. Several posts reporting no response to 911 "
                "calls due to overwhelmed lines."
            ),
            "timestamp": "2026-05-01T08:44:00-05:00",
            "credibility": "ground_report",
        },
    },
    "conflicting_signals": [
        {
            "field": "severity",
            "source_a_says": "FEMA: moderate",
            "source_b_says": "Weather.gov: catastrophic",
            "resolution": "Escalated to CRITICAL based on Weather.gov and social ground reports",
        }
    ],
    "crisis_type": "flood",
    "severity": "critical",
    "location": "Eastside District, Philadelphia, Pennsylvania",
    "affected_population": 42000,
    "risk_flags": ["elderly_residents", "non_english_speakers"],
    "earliest_signal_time": "2026-05-01T08:08:00-05:00",
    "summary": (
        "Critical flash flood in Eastside District affecting 42,000 residents "
        "with high elderly and Spanish-speaking populations."
    ),
    "vulnerability_score": 51,
    "score_breakdown": {
        "elderly": 41.3,
        "non_english": 47.8,
        "low_income": 58.2,
        "disability": 18.4,
        "severity_multiplier": 1.2,
    },
    "top_needs": [
        "bilingual_elder_care",
        "medical_transport",
        "evacuation_assistance",
        "emergency_shelter",
    ],
    "needs_rationale": (
        "High elderly and non-English speaking population requires bilingual elder "
        "care as top priority. Medical transport needed for mobility-limited "
        "residents. Evacuation assistance critical given rapid flood onset."
    ),
    "population_summary": (
        "Community of 42,000 with 41% elderly, 48% non-English speaking, 58% low "
        "income. High vulnerability score of 51/100 driven by language barriers "
        "and elderly population during critical flood event."
    ),
    "total_orgs_evaluated": 3,
    "matches": [
        {
            "org_id": "ORG001",
            "org_name": "Philadelphia Elder Care Alliance",
            "match_score": 95,
            "capabilities_matched": ["bilingual_elder_care", "medical_transport"],
            "brief": (
                "Critical flash flood in Eastside District. Vulnerability score "
                "51/100. 41% elderly population, 48% Spanish-speaking residents. "
                "Your bilingual elder care and medical transport capabilities are "
                "critically needed and currently unconfirmed by any other responder."
            ),
            "status": "ping_sent",
        },
        {
            "org_id": "ORG002",
            "org_name": "Red Cross Philadelphia",
            "match_score": 78,
            "capabilities_matched": ["emergency_shelter", "medical_transport"],
            "brief": (
                "Flash flood emergency in Eastside District affecting 42,000 "
                "residents. Your emergency shelter and mass care capabilities are "
                "needed immediately. High concentration of elderly residents "
                "requiring assistance."
            ),
            "status": "ping_sent",
        },
        {
            "org_id": "ORG003",
            "org_name": "Delaware Valley Flood Response",
            "match_score": 65,
            "capabilities_matched": ["evacuation_assistance"],
            "brief": (
                "Critical flood conditions in Eastside District. Evacuation "
                "assistance urgently needed for mobility-limited residents unable "
                "to self-evacuate."
            ),
            "status": "ping_sent",
        },
    ],
    "coverage_gaps": ["bilingual_elder_care"],
    "gap_detected": False,
    "alert_status": "all_clear",
    "unmet_needs": [],
    "confirmed_coverage": "",
    "total_needs": 4,
    "confirmed_count": 0,
    "gap_count": 0,
    "alert_message": "",
    "escalation_recommendation": "",
    "escalation_org": "",
}

MATCH_NEEDS = {
    "ORG001": ["bilingual_elder_care", "medical_transport"],
    "ORG002": ["emergency_shelter"],
    "ORG003": ["evacuation_assistance"],
}


async def run_crisiscompass_pipeline(
    crisis_id: str,
    location: str,
    db: Session,
) -> dict:
    organizations = db.scalars(
        select(Organization).where(
            Organization.id.in_(["ORG001", "ORG002", "ORG003"])
        )
    ).all()

    result = json.loads(json.dumps(HARDCODED_PIPELINE_RESULT))
    result["location"] = location

    crisis = Crisis(
        id=crisis_id or None,
        alert_text=result["unified_alert_text"],
        crisis_type=result["crisis_type"],
        severity=result["severity"],
        location=location,
        affected_population=result["affected_population"],
        risk_flags=json.dumps(result["risk_flags"]),
    )
    db.add(crisis)
    db.flush()

    db.add(
        CommunityProfile(
            crisis_id=crisis.id,
            location=location,
            vulnerability_score=result["vulnerability_score"],
            elderly_pct=result["score_breakdown"]["elderly"],
            spanish_speaking_pct=result["score_breakdown"]["non_english"],
            low_income_pct=result["score_breakdown"]["low_income"],
            mobility_limited_pct=result["score_breakdown"]["disability"],
            top_needs=json.dumps(result["top_needs"]),
        )
    )

    organization_lookup = {organization.id: organization for organization in organizations}
    pinged_timestamp = datetime.now().astimezone()

    for match in result["matches"]:
        organization = organization_lookup.get(match["org_id"])
        if organization is None:
            continue

        db.add(
            ResponseTracking(
                crisis_id=crisis.id,
                org_id=organization.id,
                needs_covered=json.dumps(MATCH_NEEDS.get(organization.id, [])),
                status="ping_sent",
                pinged_at=pinged_timestamp,
                confirmed_at=None,
            )
        )

    db.flush()

    db.add(
        PipelineResult(
            crisis_id=crisis.id,
            org_id="aggregate",
            raw_result=json.dumps(result),
        )
    )

    db.commit()
    return result
