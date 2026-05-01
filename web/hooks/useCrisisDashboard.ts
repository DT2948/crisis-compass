"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import {
  confirmOrgResponse,
  fetchActiveCrises,
  fetchActiveGaps,
  simulateGapDetection,
  triggerPipeline,
} from "@/lib/api";
import type { CrisisDetail, GapAlert } from "@/types/crisis";

const REFRESH_MS = 10_000;

interface UseCrisisDashboardResult {
  crises: CrisisDetail[];
  gapAlerts: GapAlert[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  lastUpdatedAt: number | null;
  highlightedIds: Set<string>;
  simulateGap: (crisisId: string) => Promise<void>;
  simulatingGap: boolean;
  confirmResponse: (crisisId: string, orgId: string, needsCovered: string[]) => Promise<void>;
  confirmingResponseOrgId: string | null;
  triggeringPipeline: boolean;
  triggerCrisisPipeline: () => Promise<void>;
  refresh: () => Promise<void>;
}

function buildChangeSet(previous: CrisisDetail[], next: CrisisDetail[]): Set<string> {
  const previousById = new Map(previous.map((crisis) => [crisis.id, crisis]));
  const changed = new Set<string>();

  for (const crisis of next) {
    const existing = previousById.get(crisis.id);
    if (!existing) {
      changed.add(crisis.id);
      continue;
    }

    if (
      existing.response_state !== crisis.response_state ||
      existing.gap_alerts.length !== crisis.gap_alerts.length ||
      existing.responses.some((response, index) => response.status !== crisis.responses[index]?.status)
    ) {
      changed.add(crisis.id);
    }
  }

  return changed;
}

export function useCrisisDashboard(): UseCrisisDashboardResult {
  const [crises, setCrises] = useState<CrisisDetail[]>([]);
  const [gapAlerts, setGapAlerts] = useState<GapAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [simulatingGap, setSimulatingGap] = useState(false);
  const [confirmingResponseOrgId, setConfirmingResponseOrgId] = useState<string | null>(null);
  const [triggeringPipeline, setTriggeringPipeline] = useState(false);
  const crisesRef = useRef<CrisisDetail[]>([]);

  async function refresh() {
    try {
      setError(null);
      setRefreshing(true);
      const [crisisItems, gapItems] = await Promise.all([
        fetchActiveCrises(),
        fetchActiveGaps(),
      ]);

      startTransition(() => {
        const changed = buildChangeSet(crisesRef.current, crisisItems);
        crisesRef.current = crisisItems;
        setCrises(crisisItems);
        setGapAlerts(gapItems);
        setLastUpdatedAt(Date.now());

        if (changed.size > 0) {
          setHighlightedIds(changed);
          window.setTimeout(() => {
            setHighlightedIds(new Set());
          }, 2200);
        }
      });
    } catch (caught) {
      void caught;
      setError("Data temporarily unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function simulateGap(crisisId: string) {
    try {
      setError(null);
      setSimulatingGap(true);
      await simulateGapDetection(crisisId);
      await refresh();
    } catch (caught) {
      void caught;
      setError("Data temporarily unavailable.");
    } finally {
      setSimulatingGap(false);
    }
  }

  async function confirmResponse(crisisId: string, orgId: string, needsCovered: string[]) {
    try {
      setError(null);
      setConfirmingResponseOrgId(orgId);
      await confirmOrgResponse(crisisId, orgId, needsCovered);
      await refresh();
    } catch (caught) {
      void caught;
      setError("Data temporarily unavailable.");
    } finally {
      setConfirmingResponseOrgId(null);
    }
  }

  async function triggerCrisisPipeline() {
    try {
      setError(null);
      setTriggeringPipeline(true);
      await triggerPipeline("Eastside District, Philadelphia, Pennsylvania");
      await refresh();
    } catch (caught) {
      void caught;
      setError("Data temporarily unavailable.");
    } finally {
      setTriggeringPipeline(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [autoRefresh]);

  return {
    crises,
    gapAlerts,
    loading,
    refreshing,
    error,
    autoRefresh,
    setAutoRefresh,
    lastUpdatedAt,
    highlightedIds,
    simulateGap,
    simulatingGap,
    confirmResponse,
    confirmingResponseOrgId,
    triggeringPipeline,
    triggerCrisisPipeline,
    refresh,
  };
}
