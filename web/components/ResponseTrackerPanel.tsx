"use client";

import type { CrisisDetail, ResponseState } from "@/types/crisis";

const STATE_STYLES: Record<ResponseState, string> = {
  needs_identified: "border-needsIdentified/30 bg-needsIdentified/10 text-needsIdentified",
  ping_sent: "border-pingSent/40 bg-pingSent/15 text-[#9a6a00]",
  response_confirmed:
    "border-responseConfirmed/30 bg-responseConfirmed/10 text-responseConfirmed",
  gap_flagged: "border-gapFlagged/30 bg-gapFlagged/10 text-gapFlagged",
};

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "Pending";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ResponseTrackerPanel({
  crisis,
}: {
  crisis: CrisisDetail | null;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-line/70 bg-panelStrong">
      <div className="border-b border-line/70 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Response Tracker</p>
        <h2 className="mt-2 text-xl font-semibold">
          {crisis ? crisis.location : "Select a crisis"}
        </h2>
      </div>

      {crisis ? (
        <div className="flex-1 overflow-y-auto p-4">
          {crisis.community_profile ? (
            <div className="rounded-[22px] border border-line bg-panel px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
                Community Vulnerability
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {crisis.community_profile.vulnerability_score}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
                <div className="rounded-2xl border border-line px-3 py-2">
                  Elderly: {crisis.community_profile.elderly_pct}%
                </div>
                <div className="rounded-2xl border border-line px-3 py-2">
                  Spanish-speaking: {crisis.community_profile.spanish_speaking_pct}%
                </div>
                <div className="rounded-2xl border border-line px-3 py-2">
                  Low income: {crisis.community_profile.low_income_pct}%
                </div>
                <div className="rounded-2xl border border-line px-3 py-2">
                  Mobility-limited: {crisis.community_profile.mobility_limited_pct}%
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {crisis.community_profile.top_needs.map((need) => (
                  <span
                    key={need}
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {crisis.responses.map((response) => (
              <article
                key={response.id}
                className="rounded-[22px] border border-line bg-white/80 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{response.organization.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                      {response.organization.capacity} capacity
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${STATE_STYLES[response.status]}`}
                  >
                    {response.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  {response.organization.languages.map((language) => (
                    <span key={language} className="rounded-full border border-line px-2 py-1">
                      {language}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-sm text-muted">
                  Needs covered: {response.needs_covered.join(", ")}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                  <div className="rounded-2xl border border-line px-3 py-2">
                    Pinged: {formatTimestamp(response.pinged_at)}
                  </div>
                  <div className="rounded-2xl border border-line px-3 py-2">
                    Confirmed: {formatTimestamp(response.confirmed_at)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted">
          Choose a crisis to inspect organizational coverage.
        </div>
      )}
    </aside>
  );
}
