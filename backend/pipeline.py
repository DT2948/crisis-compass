import json
import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from models.organization import Organization
from models.pipeline_result import PipelineResult
from models.response_tracking import ResponseTracking
from transform import build_flow_payload, parse_flow_result
from watsonx_client import call_crisiscompass_flow


logger = logging.getLogger(__name__)

DEMO_FEMA_SIGNAL = (
    "FLASH FLOOD EMERGENCY — National Weather Service Philadelphia PA. The "
    "Schuylkill River at Philadelphia has risen to catastrophic flood stage. "
    "Immediate evacuation required for Eastside District. Affects approximately "
    "42,000 residents including a high concentration of elderly and non-English "
    "speaking populations."
)

DEMO_WEATHER_SIGNAL = (
    "Weather.gov CATASTROPHIC FLOOD WARNING in effect until further notice. "
    "River levels at 34.2 feet, well above the 28-foot flood stage. Rainfall "
    "totals of 6.8 inches recorded in 12 hours. Conditions deteriorating. "
    "Severity assessed as CATASTROPHIC — escalated beyond initial FEMA "
    "moderate rating."
)

DEMO_NEWS_SIGNAL = (
    "Philadelphia Inquirer: Eastside District residents trapped as floodwaters "
    "rise rapidly. Emergency services overwhelmed. Elderly care facilities on "
    "Kensington Ave reporting residents unable to evacuate without assistance. "
    "Spanish-language community radio urging evacuation but many residents "
    "unreachable."
)

DEMO_SOCIAL_SIGNAL = (
    "Twitter/X aggregated: Multiple reports of elderly residents stranded on "
    "upper floors in Eastside District. Community members calling for bilingual "
    "emergency assistance. Several posts reporting no response to 911 calls due "
    "to overwhelmed lines."
)

DEMO_DEMOGRAPHICS = {
    "elderly_pct": 41.3,
    "non_english_pct": 47.8,
    "low_income_pct": 58.2,
    "disability_pct": 18.4,
    "median_household_income": 31200,
}

DEMO_TOP_NEEDS = [
    "bilingual_elder_care",
    "medical_transport",
    "evacuation_assistance",
    "emergency_shelter",
]


def _parse_json_list(value: str) -> list[str]:
    try:
        parsed = json.loads(value or "[]")
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except json.JSONDecodeError:
        pass
    return [item.strip() for item in (value or "").split(",") if item.strip()]


def aggregate_results(results: list[dict]) -> dict:
    all_matches = []
    for result in results:
        matches = result.get("matches", [])
        if isinstance(matches, list):
            all_matches.extend(matches)
        elif isinstance(matches, str):
            try:
                parsed = json.loads(matches)
                if isinstance(parsed, list):
                    all_matches.extend(parsed)
            except Exception:
                pass

    gap_result = next(
        (result for result in results if result.get("gap_detected") is True),
        results[-1],
    )
    base = results[0]

    return {
        **base,
        "matches": all_matches,
        "gap_detected": gap_result.get("gap_detected", False),
        "alert_status": gap_result.get("alert_status", "all_clear"),
        "alert_message": gap_result.get("alert_message", ""),
        "escalation_recommendation": gap_result.get("escalation_recommendation", ""),
        "escalation_org": gap_result.get("escalation_org", ""),
    }


def _normalize_token(value: str) -> str:
    return value.strip().lower().replace("_", " ")


def _select_orgs_for_pipeline(org_records: list[dict], location: str) -> list[dict]:
    normalized_location = _normalize_token(location)
    location_tokens = {
        token
        for token in normalized_location.replace(",", " ").split()
        if token not in {"district", "county", "city", "state"}
    }
    normalized_top_needs = {_normalize_token(need) for need in DEMO_TOP_NEEDS}

    scored_orgs: list[tuple[int, int, str, dict]] = []
    for org in org_records:
        coverage_text = _normalize_token(org["coverage_area"])
        coverage_tokens = set(coverage_text.replace(",", " ").split())
        location_match = int(
            normalized_location in coverage_text
            or bool(location_tokens.intersection(coverage_tokens))
        )

        services = org["services"] if isinstance(org["services"], list) else [org["services"]]
        normalized_services = {_normalize_token(service) for service in services}
        service_overlap = len(normalized_services.intersection(normalized_top_needs))

        scored_orgs.append((location_match, service_overlap, org["name"], org))

    scored_orgs.sort(key=lambda item: (-item[0], -item[1], item[2]))
    return [item[3] for item in scored_orgs[:3]]


async def run_crisiscompass_pipeline(
    crisis_id: str,
    location: str,
    db: Session,
) -> dict:
    organizations = db.scalars(select(Organization).order_by(Organization.name.asc())).all()
    org_records = [
        {
            "org_id": org.id,
            "name": org.name,
            "services": org.services_list(),
            "languages": org.languages_list(),
            "coverage_area": ", ".join(org.coverage_areas_list()),
            "capacity": org.capacity,
        }
        for org in organizations
    ]
    org_records = _select_orgs_for_pipeline(org_records, location)

    confirmed_responses = db.scalars(
        select(ResponseTracking)
        .options(selectinload(ResponseTracking.organization))
        .where(
            ResponseTracking.crisis_id == crisis_id,
            ResponseTracking.status == "response_confirmed",
        )
        .order_by(ResponseTracking.confirmed_at.asc())
    ).all()
    confirmed_response_records = [
        {
            "org_id": response.org_id,
            "org_name": response.organization.name if response.organization else "",
            "services_covering": ", ".join(_parse_json_list(response.needs_covered)),
            "status": response.status,
            "confirmed_at": response.confirmed_at.isoformat() if response.confirmed_at else "",
        }
        for response in confirmed_responses
    ]

    first_confirmed_response = confirmed_response_records[0] if confirmed_response_records else {}
    all_results: list[dict] = []

    for org in org_records:
        payload = build_flow_payload(
            DEMO_FEMA_SIGNAL,
            DEMO_WEATHER_SIGNAL,
            DEMO_NEWS_SIGNAL,
            DEMO_SOCIAL_SIGNAL,
            location,
            DEMO_DEMOGRAPHICS,
            org,
            first_confirmed_response,
        )

        try:
            raw_result = await call_crisiscompass_flow(payload)
            db.add(
                PipelineResult(
                    crisis_id=crisis_id,
                    org_id=org["org_id"],
                    raw_result=json.dumps(raw_result),
                )
            )
            db.commit()

            if "matches" not in raw_result:
                logger.error("WatsonX org result missing matches for org %s", org["org_id"])
                continue

            parsed_result = parse_flow_result(raw_result)
            matches = parsed_result.get("matches")
            if isinstance(matches, str):
                try:
                    parsed_matches = json.loads(matches)
                    if not isinstance(parsed_matches, list):
                        logger.error("WatsonX matches payload invalid for org %s", org["org_id"])
                        continue
                    parsed_result["matches"] = parsed_matches
                except json.JSONDecodeError:
                    logger.error("WatsonX matches string could not be parsed for org %s", org["org_id"])
                    continue
            elif not isinstance(matches, list):
                logger.error("WatsonX matches payload invalid type for org %s", org["org_id"])
                continue

            all_results.append(parsed_result)
        except Exception:
            logger.exception("WatsonX flow call failed for org %s", org["org_id"])
            db.rollback()
            continue

    if not all_results:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Pipeline failed — no org results returned",
        )

    return aggregate_results(all_results)
