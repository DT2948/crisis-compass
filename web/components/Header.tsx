"use client";

import { PulsingDot } from "@/components/PulsingDot";
import type { CrisisDetail } from "@/types/crisis";

export function Header({
  autoRefresh,
  onToggleAutoRefresh,
  crisisCount,
  refreshing,
  selectedCrisis,
  onSimulateGap,
  onRefresh,
}: {
  autoRefresh: boolean;
  onToggleAutoRefresh: (value: boolean) => void;
  crisisCount: number;
  refreshing: boolean;
  selectedCrisis: CrisisDetail | null;
  onSimulateGap: () => void;
  onRefresh: () => Promise<void>;
}) {
  void selectedCrisis;

  return (
    <header className="flex min-h-[50px] items-center justify-between border-b border-line bg-ink px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-panelSoft text-[11px] font-semibold tracking-[0.14em] text-primary shadow-[inset_0_0_0_1px_rgba(47,140,150,0.14)]">
          CC
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-textPrimary">
              CrisisCompass
            </h1>
            {refreshing ? (
              <span className="text-[10px] uppercase tracking-[0.18em] text-textMuted">
                Refreshing
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleAutoRefresh(!autoRefresh)}
          className="inline-flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.18em] text-textMuted transition hover:text-textPrimary"
        >
          <PulsingDot active={autoRefresh} colorClass="bg-primary" />
          <span>{autoRefresh ? "LIVE" : "PAUSED"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            void onRefresh();
          }}
          className="inline-flex items-center rounded-sm border border-line bg-transparent px-2.5 py-1.5 text-xs text-textSecondary transition hover:border-primaryHover/40 hover:text-textPrimary"
        >
          Refresh
        </button>

        <button
          type="button"
          onClick={onSimulateGap}
          disabled={!selectedCrisis}
          className="inline-flex items-center rounded-sm border border-line bg-transparent px-2.5 py-1.5 text-xs text-textSecondary transition hover:border-primaryHover/40 hover:text-textPrimary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Simulate Time Elapsed
        </button>

        <div className="px-1 text-xs text-textMuted">{crisisCount} active</div>
      </div>
    </header>
  );
}
