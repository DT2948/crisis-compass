"use client";

import type { GapAlert } from "@/types/crisis";

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function GapAlertPanel({
  alerts,
}: {
  alerts: GapAlert[];
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-line/70 bg-panelStrong">
      <div className="border-b border-line/70 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Gap Alerts</p>
        <h2 className="mt-2 text-xl font-semibold">Unconfirmed Critical Needs</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-[22px] border border-gapFlagged/20 bg-white/80 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-gapFlagged px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white">
                  Gap Flagged
                </span>
                <span className="text-xs text-muted">{formatTimestamp(alert.fired_at)}</span>
              </div>
              <p className="mt-3 text-sm font-semibold">{alert.alert_message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {alert.unmet_needs.map((need) => (
                  <span key={need} className="rounded-full border border-line px-2 py-1 text-xs">
                    {need}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {alert.escalation_recommendation}
              </p>
            </article>
          ))}
          {alerts.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-line px-4 py-8 text-sm text-muted">
              No active gap alerts.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
