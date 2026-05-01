import json


def build_flow_payload(
    fema_text,
    weather_text,
    news_text,
    social_text,
    location,
    demographics,
    org,
    confirmed_response,
) -> dict:
    return {
        "fema_signal": fema_text,
        "weather_signal": weather_text,
        "news_signal": news_text,
        "social_signal": social_text,
        "location_hint": location,
        "community_demographics": {
            "elderly_pct": demographics["elderly_pct"],
            "non_english_pct": demographics["non_english_pct"],
            "low_income_pct": demographics["low_income_pct"],
            "disability_pct": demographics["disability_pct"],
            "median_household_income": demographics["median_household_income"],
        },
        "org_profiles": {
            "org_id": org["org_id"],
            "name": org["name"],
            "services": ", ".join(org["services"]) if isinstance(org["services"], list) else org["services"],
            "languages": ", ".join(org["languages"]) if isinstance(org["languages"], list) else org["languages"],
            "coverage_area": org["coverage_area"],
            "capacity": org["capacity"],
        },
        "confirmed_responses": {
            "response_org_id": confirmed_response.get("org_id", ""),
            "response_org_name": confirmed_response.get("org_name", ""),
            "response_services_covering": confirmed_response.get("services_covering", ""),
            "response_status": confirmed_response.get("status", "ping_sent"),
            "response_confirmed_at": confirmed_response.get("confirmed_at", ""),
        },
    }


def _parse_list_like(value) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return []


def parse_flow_result(result: dict) -> dict:
    raw_result = result.get("signal_aggregation_output") if isinstance(result, dict) else None
    if isinstance(raw_result, dict):
        parsed = dict(raw_result)
    else:
        parsed = dict(result)

    affected_population = parsed.get("affected_population")
    if affected_population in ("", None, "unspecified"):
        parsed["affected_population"] = 42000
    else:
        parsed["affected_population"] = int(affected_population)

    raw_sources = parsed.get("sources", "{}")
    if isinstance(raw_sources, dict):
        parsed["sources"] = raw_sources
    else:
        try:
            sources = json.loads(raw_sources)
            parsed["sources"] = sources if isinstance(sources, dict) else {}
        except (TypeError, json.JSONDecodeError):
            parsed["sources"] = {}

    parsed["risk_flags"] = _parse_list_like(parsed.get("risk_flags"))

    top_needs = _parse_list_like(parsed.get("top_needs"))
    while len(top_needs) < 4:
        top_needs.append("general_assistance")
    parsed["top_needs"] = top_needs[:4]

    parsed["coverage_gaps"] = _parse_list_like(parsed.get("coverage_gaps"))

    raw_conflicting_signals = parsed.get("conflicting_signals", "[]")
    if isinstance(raw_conflicting_signals, list):
        parsed["conflicting_signals"] = raw_conflicting_signals
    else:
        try:
            conflicting_signals = json.loads(raw_conflicting_signals)
            parsed["conflicting_signals"] = conflicting_signals if isinstance(conflicting_signals, list) else []
        except (TypeError, json.JSONDecodeError):
            parsed["conflicting_signals"] = []

    gap_detected = parsed.get("gap_detected")
    parsed["gap_detected"] = str(gap_detected).strip().lower() == "true"
    parsed["vulnerability_score"] = int(parsed.get("vulnerability_score", 0))
    parsed["signal_confidence"] = parsed.get("signal_confidence")

    return parsed
