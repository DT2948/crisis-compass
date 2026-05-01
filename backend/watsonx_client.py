import json
import logging
import os

import httpx
import requests


logger = logging.getLogger(__name__)

IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token"
AGENT_ID = os.getenv("WATSONX_AGENT_ID", "88595355-5f82-4ce8-b394-a655d26fab95")
WATSONX_BASE_URL = os.getenv(
    "WATSONX_BASE_URL",
    "https://eu-de.watson-orchestrate.cloud.ibm.com",
)


def get_iam_token(api_key: str) -> str:
    response = requests.post(
        IAM_TOKEN_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": api_key,
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def build_message_content(payload: dict) -> str:
    return (
        f'fema_signal: {payload["fema_signal"]}\n'
        f'weather_signal: {payload["weather_signal"]}\n'
        f'news_signal: {payload["news_signal"]}\n'
        f'social_signal: {payload["social_signal"]}\n'
        f'location_hint: {payload["location_hint"]}\n'
        f'community_demographics: {json.dumps(payload["community_demographics"])}\n'
        f'org_profiles: {json.dumps(payload["org_profiles"])}\n'
        f'confirmed_responses: {json.dumps(payload["confirmed_responses"])}'
    )


async def call_crisiscompass_flow(payload: dict) -> dict:
    api_key = os.getenv("WATSONX_API_KEY", "")
    if not api_key:
        raise ValueError("Missing WATSONX_API_KEY")

    token = get_iam_token(api_key)
    url = f"{WATSONX_BASE_URL}/api/v1/orchestrate/{AGENT_ID}/chat/completions"
    message_content = build_message_content(payload)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "messages": [
                    {
                        "role": "human",
                        "content": message_content,
                    }
                ],
                "additional_parameters": {},
                "context": {},
                "stream": False,
            },
        )

    if response.status_code >= 400:
        logger.error(f"WatsonX error response body: {response.text}")
    response.raise_for_status()

    try:
        response_body = response.json()
        content = response_body["choices"][0]["message"]["content"]
        parsed_content = json.loads(content)
        return parsed_content["signal_aggregation_output"]
    except Exception as exc:
        logger.exception("Failed to parse WatsonX agent response. Raw response: %s", response.text)
        raise Exception("Failed to parse WatsonX agent response") from exc
