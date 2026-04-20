"use client";

import { startTransition, useEffect, useState } from "react";

import { fetchActiveCrises, fetchActiveGaps, simulateGapDetection } from "@/lib/api";
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
  simulateGap: (crisisId: string) => Promise<void>;
}

export function useCrisisDashboard(): UseCrisisDashboardResult {
  const [crises, setCrises] = useState<CrisisDetail[]>([]);
  const [gapAlerts, setGapAlerts] = useState<GapAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  async function refresh() {
    try {
      setError(null);
      setRefreshing(true);
      const [crisisItems, gapItems] = await Promise.all([
        fetchActiveCrises(),
        fetchActiveGaps(),
      ]);
      startTransition(() => {
        setCrises(crisisItems);
        setGapAlerts(gapItems);
        setLastUpdatedAt(Date.now());
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
    simulateGap,
  };
}
