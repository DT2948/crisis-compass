from pydantic import BaseModel


class CrisisIntakeRequest(BaseModel):
    alert_text: str


class CrisisIntakeResponse(BaseModel):
    crisis_type: str
    severity: str
    location: str
    affected_population: int
    risk_flags: list[str]


class CommunityNeedsRequest(BaseModel):
    location: str
    crisis_type: str


class CommunityNeedsResponse(BaseModel):
    vulnerability_score: int
    demographics: dict[str, float]
    top_needs: list[str]


class OrgMatchingRequest(BaseModel):
    top_needs: list[str]
    location: str
    vulnerability_score: int


class MatchedOrganizationResponse(BaseModel):
    name: str
    match_score: int
    capabilities_matched: list[str]
    brief: str
    status: str


class OrgMatchingResponse(BaseModel):
    organizations: list[MatchedOrganizationResponse]


class GapDetectionRequest(BaseModel):
    crisis_id: str


class GapDetectionResponse(BaseModel):
    gap_detected: bool
    unmet_needs: list[str]
    alert_message: str
    escalation_recommendation: str
