"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { CrisisFeed } from "@/components/CrisisFeed";
import { GapAlertPanel } from "@/components/GapAlertPanel";
import { Header } from "@/components/Header";
import { ResponseTrackerPanel } from "@/components/ResponseTrackerPanel";
import { StatusBar } from "@/components/StatusBar";
import { useCrisisDashboard } from "@/hooks/useCrisisDashboard";

const CrisisMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
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
    simulateGap,
  } = useCrisisDashboard();
  const [selectedCrisisId, setSelectedCrisisId] = useState<string | null>(null);

  const selectedCrisis =
    crises.find((crisis) => crisis.id === selectedCrisisId) ?? crises[0] ?? null;

  return (
    <main className="h-screen overflow-hidden px-4 py-4 text-ink">
      <div className="mx-auto flex h-full max-w-[1720px] flex-col overflow-hidden rounded-[28px] border border-line/80 bg-panel/80 shadow-card backdrop-blur">
        <Header
          autoRefresh={autoRefresh}
          refreshing={refreshing}
          activeCount={crises.length}
          selectedCrisis={selectedCrisis}
          onToggleAutoRefresh={setAutoRefresh}
          onSimulateGap={() => selectedCrisis && simulateGap(selectedCrisis.id)}
        />

        <section className="grid min-h-0 flex-1 gap-4 overflow-hidden border-t border-line/70 p-4 lg:grid-cols-[330px_minmax(0,1fr)_380px]">
          <div className="min-h-0 overflow-hidden">
            <CrisisFeed
              crises={crises}
              selectedCrisisId={selectedCrisis?.id ?? null}
              onSelectCrisis={setSelectedCrisisId}
            />
          </div>

          <div className="grid min-h-0 gap-4 overflow-hidden lg:grid-rows-[minmax(0,1fr)_220px]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[24px] border border-line/70 bg-panelStrong">
              <div className="absolute inset-0">
                <CrisisMap
                  crises={crises}
                  selectedCrisisId={selectedCrisis?.id ?? null}
                  onSelectCrisis={setSelectedCrisisId}
                />
              </div>
              {loading ? (
                <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-line bg-panel px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted">
                  Loading Pennsylvania live view
                </div>
              ) : null}
              {error ? (
                <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-2xl border border-gapFlagged/30 bg-white/85 px-4 py-3 text-sm text-gapFlagged">
                  {error}
                </div>
              ) : null}
            </div>

            <GapAlertPanel alerts={gapAlerts} />
          </div>

          <div className="min-h-0 overflow-hidden">
            <ResponseTrackerPanel crisis={selectedCrisis} />
          </div>
        </section>

        <StatusBar lastUpdatedAt={lastUpdatedAt} totalAlerts={gapAlerts.length} />
      </div>
    </main>
  );
}
