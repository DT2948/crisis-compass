import json

from database import SessionLocal
from models.organization import Organization


ORGANIZATION_SEEDS = [
    {
        "id": "ORG001",
        "name": "Philadelphia Elder Care Alliance",
        "services": ["bilingual_elder_care", "medical_transport"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Eastside District, Philadelphia"],
        "capacity": "medium",
    },
    {
        "id": "ORG002",
        "name": "Red Cross Philadelphia",
        "services": ["emergency_shelter", "medical_transport", "mass_care"],
        "languages": ["English", "Spanish"],
        "coverage_areas": ["Citywide Philadelphia"],
        "capacity": "high",
    },
    {
        "id": "ORG003",
        "name": "Delaware Valley Flood Response",
        "services": ["evacuation_assistance", "debris_removal"],
        "languages": ["English"],
        "coverage_areas": ["Philadelphia, Delaware Valley"],
        "capacity": "medium",
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
                    id=organization["id"],
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
