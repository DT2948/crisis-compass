"use client";

import type { CrisisDetail } from "@/types/crisis";

function formatStateLabel(state: CrisisDetail["response_state"] | undefined): string {
  if (!state) {
    return "No crisis selected";
  }

  return state.replaceAll("_", " ");
}

export function Header({
  autoRefresh,
  refreshing,
  activeCount,
  selectedCrisis,
  onToggleAutoRefresh,
  onSimulateGap,
}: {
  autoRefresh: boolean;
  refreshing: boolean;
  activeCount: number;
  selectedCrisis: CrisisDetail | null;
  onToggleAutoRefresh: (value: boolean) => void;
  onSimulateGap: () => void;
}) {
  return (
    <header className="relative overflow-hidden px-6 py-5">
      <div className="absolute left-8 top-4 h-24 w-24 rounded-full bg-flood/10 blur-2xl" />
      <div className="absolute right-12 top-2 h-28 w-28 rounded-full bg-wildfire/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 animate-drift items-center justify-center rounded-2xl border border-line bg-panelStrong text-lg font-semibold">
              CC
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-muted">
                IBM WatsonX Experimental Learning Lab | April 2026
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">CrisisCompass</h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted">
            Humanitarian crisis intelligence for relief coordinators. Monitor affected communities,
            track organizational coverage, and surface unresolved needs before gaps widen.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-line bg-panelStrong px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Active Crises</p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </div>
          <div className="rounded-3xl border border-line bg-panelStrong px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Selected State</p>
            <p className="mt-2 text-lg font-semibold capitalize">
              {formatStateLabel(selectedCrisis?.response_state)}
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-panelStrong px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Control Center</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleAutoRefresh(!autoRefresh)}
                className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted transition hover:bg-white/70"
              >
                {autoRefresh ? "Live On" : "Live Off"}
              </button>
              <button
                type="button"
                onClick={onSimulateGap}
                className="rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-[0.18em] text-white transition hover:opacity-90"
              >
                Simulate Time Elapsed
              </button>
            </div>
            {refreshing ? (
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                Refreshing live data...
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
