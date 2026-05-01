"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { CrisisFeed } from "@/components/CrisisFeed";
import { Header } from "@/components/Header";
import { SignalIntelligencePanel } from "@/components/SignalIntelligencePanel";
import { StatusBar } from "@/components/StatusBar";
import { useCrisisDashboard } from "@/hooks/useCrisisDashboard";
import { fetchCrisisSources } from "@/lib/api";
import type { SignalIntelligence } from "@/types/crisis";

const CrisisMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center border border-line bg-panel text-sm text-textMuted">
      Loading map...
    </div>
  ),
});

export default function DashboardPage() {
  const {
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
  } = useCrisisDashboard();
  const [selectedCrisisId, setSelectedCrisisId] = useState<string | null>(null);
  const [signalIntelligence, setSignalIntelligence] = useState<SignalIntelligence | null>(null);
  const [signalLoading, setSignalLoading] = useState(false);

  const selectedCrisis =
    crises.find((crisis) => crisis.id === selectedCrisisId) ?? null;

  function handleSelectCrisis(id: string) {
    setSelectedCrisisId((current) => (current === id ? null : id));
  }

  useEffect(() => {
    async function loadSignalIntelligence(crisisId: string) {
      try {
        setSignalLoading(true);
        const result = await fetchCrisisSources(crisisId);
        setSignalIntelligence(result);
      } catch {
        setSignalIntelligence(null);
      } finally {
        setSignalLoading(false);
      }
    }

    if (!selectedCrisis?.id) {
      setSignalIntelligence(null);
      return;
    }

    void loadSignalIntelligence(selectedCrisis.id);
  }, [selectedCrisis?.id, lastUpdatedAt]);

  return (
    <main className="h-screen overflow-hidden bg-transparent px-0 py-0 text-textPrimary">
      <div className="mx-auto flex h-full max-w-[1800px] flex-col gap-0 overflow-hidden">
        <div className="shrink-0">
          <Header
            autoRefresh={autoRefresh}
            onToggleAutoRefresh={setAutoRefresh}
            crisisCount={crises.length}
            refreshing={refreshing}
            triggeringPipeline={triggeringPipeline}
            selectedCrisisId={selectedCrisis?.id ?? null}
            onSimulateGap={(crisisId) => {
              void simulateGap(crisisId);
            }}
            onTriggerPipeline={() => {
              void triggerCrisisPipeline();
            }}
            onRefresh={refresh}
          />
        </div>

        <section className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden lg:flex-row">
          <div className="relative min-h-[42vh] flex-1 overflow-hidden lg:min-h-0">
            <div className="absolute inset-0">
              <CrisisMap
                crises={crises}
                selectedCrisisId={selectedCrisis?.id ?? null}
                onSelectCrisis={handleSelectCrisis}
              />
            </div>
            {loading ? (
              <div className="pointer-events-none absolute inset-x-3 top-3 border border-line bg-ink/90 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-textMuted backdrop-blur">
                Connecting to live crisis map...
              </div>
            ) : null}
            {error ? (
              <div className="pointer-events-none absolute inset-x-3 top-14 border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger backdrop-blur">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 w-full flex-col overflow-hidden lg:w-[380px] xl:w-[32%]">
            <div className="min-h-0 flex-1 overflow-hidden">
              <CrisisFeed
                crises={crises}
                selectedCrisisId={selectedCrisis?.id ?? null}
                highlightedIds={highlightedIds}
                onSelectCrisis={handleSelectCrisis}
              />
            </div>
            {selectedCrisis ? (
              <div className="min-h-[280px] max-h-[42%] overflow-hidden border-t border-line">
                <SignalIntelligencePanel
                  crisis={selectedCrisis}
                  sources={signalIntelligence}
                  loading={signalLoading}
                />
              </div>
            ) : null}
          </div>
        </section>

        <div className="shrink-0">
          <StatusBar
            lastUpdatedAt={lastUpdatedAt}
            autoRefresh={autoRefresh}
            gapAlertCount={gapAlerts.length}
          />
        </div>
      </div>
    </main>
  );
}
