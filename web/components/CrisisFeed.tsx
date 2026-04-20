"use client";

import type { CrisisDetail } from "@/types/crisis";

const TYPE_LABELS: Record<CrisisDetail["crisis_type"], string> = {
  flood: "Flood",
  wildfire: "Wildfire",
  health_emergency: "Health Emergency",
  storm: "Storm",
  other: "Other",
};

const STATE_CLASSES: Record<CrisisDetail["response_state"], string> = {
  needs_identified: "bg-needsIdentified",
  ping_sent: "bg-pingSent",
  response_confirmed: "bg-responseConfirmed",
  gap_flagged: "bg-gapFlagged",
};

function formatPopulation(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function CrisisFeed({
  crises,
  selectedCrisisId,
  onSelectCrisis,
}: {
  crises: CrisisDetail[];
  selectedCrisisId: string | null;
  onSelectCrisis: (crisisId: string) => void;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-line/70 bg-panelStrong">
      <div className="border-b border-line/70 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Crisis Overview</p>
        <h2 className="mt-2 text-xl font-semibold">Affected Communities</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {crises.map((crisis) => {
            const selected = crisis.id === selectedCrisisId;
            return (
              <button
                key={crisis.id}
                type="button"
                onClick={() => onSelectCrisis(crisis.id)}
                className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                  selected
                    ? "border-ink bg-white shadow-card"
                    : "border-line/70 bg-panel hover:bg-white/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
                      {TYPE_LABELS[crisis.crisis_type]}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{crisis.location}</h3>
                  </div>
                  <span
                    className={`mt-1 inline-flex h-3 w-3 rounded-full ${STATE_CLASSES[crisis.response_state]}`}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {crisis.alert_text}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="rounded-full border border-line px-2 py-1">
                    Severity: {crisis.severity}
                  </span>
                  <span className="rounded-full border border-line px-2 py-1">
                    Population: {formatPopulation(crisis.affected_population)}
                  </span>
                  <span className="rounded-full border border-line px-2 py-1">
                    Risk flags: {crisis.risk_flags.length}
                  </span>
                </div>
              </button>
            );
          })}
          {crises.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
              No active crises available.
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
