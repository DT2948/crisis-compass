from datetime import datetime

from pydantic import BaseModel


class CrisisMapPoint(BaseModel):
    latitude: float
    longitude: float


class CommunityProfileResponse(BaseModel):
    id: str
    crisis_id: str
    location: str
    vulnerability_score: int
    elderly_pct: float
    spanish_speaking_pct: float
    low_income_pct: float
    mobility_limited_pct: float
    top_needs: list[str]


class OrganizationResponse(BaseModel):
    id: str
    name: str
    services: list[str]
    languages: list[str]
    coverage_areas: list[str]
    capacity: str


class ResponseTrackingResponse(BaseModel):
    id: str
    crisis_id: str
    org_id: str
    needs_covered: list[str]
    status: str
    pinged_at: datetime | None
    confirmed_at: datetime | None
    organization: OrganizationResponse


class GapAlertResponse(BaseModel):
    id: str
    crisis_id: str
    unmet_needs: list[str]
    alert_message: str
    escalation_recommendation: str
    fired_at: datetime


class CrisisTriggerRequest(BaseModel):
    location: str


class CrisisSummaryResponse(BaseModel):
    id: str
    alert_text: str
    crisis_type: str
    severity: str
    location: str
    affected_population: int
    risk_flags: list[str]
    created_at: datetime
    response_state: str
    coordinates: CrisisMapPoint


class CrisisDetailResponse(CrisisSummaryResponse):
    community_profile: CommunityProfileResponse | None
    responses: list[ResponseTrackingResponse]
    gap_alerts: list[GapAlertResponse]


class CrisisListResponse(BaseModel):
    total: int
    items: list[CrisisDetailResponse]


class ResponseConfirmationRequest(BaseModel):
    crisis_id: str
    org_id: str
    needs_covered: list[str]


class SimulateElapsedRequest(BaseModel):
    crisis_id: str


class GapStatusResponse(BaseModel):
    gap_detected: bool
    alert_status: str
    alert_message: str
    escalation_recommendation: str
    escalation_org: str
    unmet_needs: list[str]
