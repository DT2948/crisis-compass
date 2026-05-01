"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import {
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
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load live crisis coordination data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function simulateGap(crisisId: string) {
    try {
      setRefreshing(true);
      await simulateGapDetection(crisisId);
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Gap simulation failed.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function triggerCrisisPipeline() {
    try {
      setError(null);
      setTriggeringPipeline(true);
      await triggerPipeline("Eastside District, Philadelphia, Pennsylvania");
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Pipeline trigger failed.",
      );
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
    triggeringPipeline,
    triggerCrisisPipeline,
    refresh,
  };
}
