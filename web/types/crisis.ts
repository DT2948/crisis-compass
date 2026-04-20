export type CrisisType =
  | "flood"
  | "wildfire"
  | "health_emergency"
  | "storm"
  | "other";

export type ResponseState =
  | "needs_identified"
  | "ping_sent"
  | "response_confirmed"
  | "gap_flagged";

export interface CrisisMapPoint {
  latitude: number;
  longitude: number;
}

export interface CommunityProfile {
  id: string;
  crisis_id: string;
  location: string;
  vulnerability_score: number;
  elderly_pct: number;
  spanish_speaking_pct: number;
  low_income_pct: number;
  mobility_limited_pct: number;
  top_needs: string[];
}

export interface Organization {
  id: string;
  name: string;
  services: string[];
  languages: string[];
  coverage_areas: string[];
  capacity: string;
}

export interface ResponseTracking {
  id: string;
  crisis_id: string;
  org_id: string;
  needs_covered: string[];
  status: ResponseState;
  pinged_at: string | null;
  confirmed_at: string | null;
  organization: Organization;
}

export interface GapAlert {
  id: string;
  crisis_id: string;
  unmet_needs: string[];
  alert_message: string;
  escalation_recommendation: string;
  fired_at: string;
}

export interface CrisisDetail {
  id: string;
  alert_text: string;
  crisis_type: CrisisType;
  severity: string;
  location: string;
  affected_population: number;
  risk_flags: string[];
  created_at: string;
  response_state: ResponseState;
  coordinates: CrisisMapPoint;
  community_profile: CommunityProfile | null;
  responses: ResponseTracking[];
  gap_alerts: GapAlert[];
}

export interface CrisisListResponse {
  total: number;
  items: CrisisDetail[];
}

export interface GapDetectionResponse {
  gap_detected: boolean;
  unmet_needs: string[];
  alert_message: string;
  escalation_recommendation: string;
}
