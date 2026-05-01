"use client";

import { CrisisDetail } from "@/components/CrisisDetail";
import { StateBadge } from "@/components/StateBadge";
import type { CrisisDetail as Crisis } from "@/types/crisis";

function typeCode(type: Crisis["crisis_type"]): string {
  switch (type) {
    case "flood":
      return "FL";
    case "wildfire":
      return "WF";
    case "health_emergency":
      return "HE";
    case "storm":
      return "ST";
    default:
      return "CR";
  }
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`);
  if (Number.isNaN(date.getTime())) {
    return "unknown time";
  }
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

function severityTone(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "border border-danger/35 bg-danger/10 text-[#e7a6ac]";
    case "high":
      return "border border-amber-400/35 bg-amber-500/10 text-amber-200";
    case "medium":
      return "border border-yellow-400/35 bg-yellow-500/10 text-yellow-200";
    default:
      return "border border-blue-400/35 bg-blue-500/10 text-blue-200";
  }
}

export function CrisisCard({
  crisis,
  expanded,
  onClick,
  highlighted,
}: {
  crisis: Crisis;
  expanded: boolean;
  onClick: () => void;
  highlighted: boolean;
}) {
  const accentColor = {
    needs_identified: "#4D8FB7",
    ping_sent: "#C39A33",
    response_confirmed: "#2FA26D",
    gap_flagged: "#C15B63",
  }[crisis.response_state];

  return (
    <button
      id={`crisis-${crisis.id}`}
      type="button"
      onClick={onClick}
      style={{ borderLeftColor: accentColor }}
      className={`w-full border-l-[3px] bg-transparent px-3 py-3 text-left transition hover:bg-panel/40 ${
        highlighted ? "veriti-card-flash" : ""
      } ${expanded ? "bg-panel/60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-panelSoft text-[10px] font-semibold tracking-[0.08em] text-primary">
          {typeCode(crisis.crisis_type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <h3 className="truncate pr-2 text-sm font-semibold text-textPrimary">
                  {crisis.location}
                </h3>
                <div className="text-sm text-textMuted transition-transform">
                  {expanded ? "▲" : "▼"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${severityTone(crisis.severity)}`}>
                  {crisis.severity}
                </span>
                <StateBadge state={crisis.response_state} />
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-textSecondary">
                <p>{formatRelativeTime(crisis.created_at)}</p>
                <p className="text-textMuted">•</p>
                <p>{crisis.responses.length} orgs tracked</p>
              </div>

              <p className="truncate text-xs text-textMuted">{crisis.alert_text}</p>
            </div>
          </div>

          {expanded ? (
            <div className="mt-3">
              <CrisisDetail crisis={crisis} />
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
