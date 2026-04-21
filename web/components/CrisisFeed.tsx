"use client";

import { useEffect } from "react";

import { CrisisCard } from "@/components/CrisisCard";
import type { CrisisDetail } from "@/types/crisis";

export function CrisisFeed({
  crises,
  selectedCrisisId,
  highlightedIds,
  onSelectCrisis,
}: {
  crises: CrisisDetail[];
  selectedCrisisId: string | null;
  highlightedIds: Set<string>;
  onSelectCrisis: (crisisId: string) => void;
}) {
  useEffect(() => {
    if (!selectedCrisisId) {
      return;
    }

    const element = document.getElementById(`crisis-${selectedCrisisId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedCrisisId]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-ink">
      <div className="shrink-0 border-b border-line px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-textMuted">
          Crisis Feed
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-line">
          {crises.map((crisis) => (
            <CrisisCard
              key={crisis.id}
              crisis={crisis}
              expanded={selectedCrisisId === crisis.id}
              highlighted={highlightedIds.has(crisis.id)}
              onClick={() => onSelectCrisis(crisis.id)}
            />
          ))}
          {crises.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-textMuted">
              No active crises available.
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
