import type {
  CrisisDetail,
  CrisisListResponse,
  GapAlert,
  GapDetectionResponse,
} from "@/types/crisis";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchActiveCrises(): Promise<CrisisDetail[]> {
  const response = await fetchJson<CrisisListResponse>("/api/crisis/active");
  return response.items;
}

export async function fetchActiveGaps(): Promise<GapAlert[]> {
  return fetchJson<GapAlert[]>("/api/gaps/active");
}

export async function simulateGapDetection(
  crisisId: string,
): Promise<GapDetectionResponse> {
  return fetchJson<GapDetectionResponse>("/api/agents/gap-detection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ crisis_id: crisisId }),
  });
}
