import json

from database import SessionLocal
from models.organization import Organization


ORGANIZATION_SEEDS = [
    {
        "name": "American Red Cross Philadelphia",
        "services": ["emergency_shelter", "mass_care", "supplies"],
        "languages": ["English"],
        "coverage_areas": ["Philadelphia", "Eastside District"],
        "capacity": "High",
    },
    {
        "name": "Liberty Medical Transit",
        "services": ["medical_transport", "wheelchair_vans"],
        "languages": ["English"],
        "coverage_areas": ["Philadelphia County"],
        "capacity": "Medium",
    },
    {
        "name": "Riverfront Relief Pantry",
        "services": ["food_distribution", "supply_delivery"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Eastside District", "Kensington"],
        "capacity": "Low",
    },
    {
        "name": "Philadelphia Community Health Network",
        "services": ["bilingual_outreach", "elder_care_navigation", "wellness_checks"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Philadelphia", "North Philadelphia"],
        "capacity": "Medium",
    },
    {
        "name": "Keystone Family Support Services",
        "services": ["case_management", "benefits_navigation", "family_reunification"],
        "languages": ["English", "Spanish", "Portuguese"],
        "coverage_areas": ["Philadelphia", "Camden"],
        "capacity": "Medium",
    },
    {
        "name": "Schuylkill Senior Aid Collective",
        "services": ["elder_care", "home_visits", "medication_support"],
        "languages": ["English"],
        "coverage_areas": ["Philadelphia", "Eastside District"],
        "capacity": "Low",
    },
    {
        "name": "Bilingual Crisis Outreach Alliance",
        "services": ["bilingual_elder_care", "community_outreach", "translation_support"],
        "languages": ["English", "Spanish", "Mandarin"],
        "coverage_areas": ["Philadelphia", "Kensington", "Frankford"],
        "capacity": "Medium",
    },
    {
        "name": "Safe Harbor Housing Partners",
        "services": ["emergency_shelter", "temporary_housing", "hotel_coordination"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Philadelphia County"],
        "capacity": "High",
    },
    {
        "name": "Metro Accessible Transport",
        "services": ["medical_transport", "evacuation_assistance", "mobility_support"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Philadelphia", "Delaware County"],
        "capacity": "Medium",
    },
    {
        "name": "Neighborhood Rx Continuity Team",
        "services": ["prescription_continuity", "pharmacy_delivery", "wellness_checks"],
        "languages": ["English"],
        "coverage_areas": ["Philadelphia", "Eastside District"],
        "capacity": "Low",
    },
    {
        "name": "Penn Mutual Aid Logistics",
        "services": ["supply_delivery", "cleanup_kits", "volunteer_coordination"],
        "languages": ["English"],
        "coverage_areas": ["Pennsylvania", "Philadelphia"],
        "capacity": "Medium",
    },
    {
        "name": "Delaware Valley Flood Response",
        "services": ["cleanup_kits", "debris_removal", "muck_out_support"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Philadelphia", "Bucks County", "Montgomery County"],
        "capacity": "Medium",
    },
    {
        "name": "Eastside Faith Relief Coalition",
        "services": ["food_distribution", "temporary_housing", "volunteer_shelter_staff"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Eastside District"],
        "capacity": "Low",
    },
    {
        "name": "Philly Public Health Mobile Unit",
        "services": ["mobile_health", "triage", "prescription_continuity"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Philadelphia County"],
        "capacity": "High",
    },
    {
        "name": "Regional Disability Support Network",
        "services": ["disability_support", "accessible_evacuation", "caregiver_coordination"],
        "languages": ["English"],
        "coverage_areas": ["Philadelphia", "South Jersey"],
        "capacity": "Medium",
    },
]


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        existing_names = {
            name for (name,) in db.query(Organization.name).all()
        }
        missing_orgs = [
            organization
            for organization in ORGANIZATION_SEEDS
            if organization["name"] not in existing_names
        ]

        for organization in missing_orgs:
            db.add(
                Organization(
                    name=organization["name"],
                    services=json.dumps(organization["services"]),
                    languages=json.dumps(organization["languages"]),
                    coverage_areas=json.dumps(organization["coverage_areas"]),
                    capacity=organization["capacity"],
                )
            )

        if missing_orgs:
            db.commit()
    finally:
        db.close()
