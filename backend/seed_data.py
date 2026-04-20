import json
from datetime import datetime, timedelta, timezone

from database import SessionLocal
from models.community_profile import CommunityProfile
from models.crisis import Crisis
from models.gap_alert import GapAlert
from models.organization import Organization
from models.response_tracking import ResponseTracking


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        if db.query(Crisis).count() > 0:
            return

        now = datetime.now(timezone.utc)

        crisis = Crisis(
            alert_text=(
                "Flash flood warning for Eastside District, Pennsylvania. Neighborhood "
                "streets are inundated, several apartment blocks report basement flooding, "
                "and mobility-limited residents may need wellness checks."
            ),
            crisis_type="flood",
            severity="high",
            location="Eastside District, Pennsylvania",
            affected_population=18400,
            risk_flags=json.dumps(
                ["flash_flooding", "elderly_residents", "language_access", "transport_disruption"]
            ),
            created_at=now - timedelta(hours=2),
        )
        db.add(crisis)
        db.flush()

        profile = CommunityProfile(
            crisis_id=crisis.id,
            location=crisis.location,
            vulnerability_score=87,
            elderly_pct=24.5,
            spanish_speaking_pct=31.0,
            low_income_pct=42.0,
            mobility_limited_pct=14.0,
            top_needs=json.dumps(
                [
                    "bilingual elder care outreach",
                    "flood cleanup kits",
                    "temporary shelter transport",
                    "prescription continuity",
                ]
            ),
        )
        db.add(profile)

        organizations = [
            Organization(
                name="Keystone Relief Network",
                services=json.dumps(["shelter coordination", "cleanup kits", "case management"]),
                languages=json.dumps(["English", "Spanish"]),
                coverage_areas=json.dumps(["Pennsylvania", "Eastside District"]),
                capacity="High",
            ),
            Organization(
                name="River Valley Health Collaborative",
                services=json.dumps(["mobile health", "prescription continuity", "wellness checks"]),
                languages=json.dumps(["English"]),
                coverage_areas=json.dumps(["Pennsylvania"]),
                capacity="Medium",
            ),
            Organization(
                name="Neighbors Transit Mutual Aid",
                services=json.dumps(["wheelchair transport", "evacuation rides", "supply delivery"]),
                languages=json.dumps(["English", "Spanish"]),
                coverage_areas=json.dumps(["Eastside District", "Allegheny Corridor"]),
                capacity="Low",
            ),
        ]
        db.add_all(organizations)
        db.flush()

        responses = [
            ResponseTracking(
                crisis_id=crisis.id,
                org_id=organizations[0].id,
                needs_covered=json.dumps(["flood cleanup kits", "temporary shelter transport"]),
                status="response_confirmed",
                pinged_at=now - timedelta(hours=1, minutes=40),
                confirmed_at=now - timedelta(hours=1, minutes=5),
            ),
            ResponseTracking(
                crisis_id=crisis.id,
                org_id=organizations[1].id,
                needs_covered=json.dumps(["prescription continuity"]),
                status="ping_sent",
                pinged_at=now - timedelta(minutes=55),
                confirmed_at=None,
            ),
            ResponseTracking(
                crisis_id=crisis.id,
                org_id=organizations[2].id,
                needs_covered=json.dumps(["temporary shelter transport"]),
                status="needs_identified",
                pinged_at=None,
                confirmed_at=None,
            ),
        ]
        db.add_all(responses)

        alert = GapAlert(
            crisis_id=crisis.id,
            unmet_needs=json.dumps(["bilingual elder care outreach"]),
            alert_message="No confirmed bilingual elder care response for Eastside District.",
            escalation_recommendation=(
                "Escalate to community health partners with bilingual outreach capacity within 30 minutes."
            ),
            fired_at=now - timedelta(minutes=10),
        )
        db.add(alert)
        db.commit()
    finally:
        db.close()
