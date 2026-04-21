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
      <div className="flex items-start gap-2">
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-panelSoft text-[10px] font-semibold tracking-[0.08em] text-primary">
          {typeCode(crisis.crisis_type)}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-sm font-semibold text-textPrimary">
                {crisis.location}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.14em] text-textMuted">
                {crisis.crisis_type.replaceAll("_", " ")}
              </p>
            </div>
            <StateBadge state={crisis.response_state} />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-textSecondary">
            <p className="capitalize">{crisis.severity} severity</p>
            <p className="text-textMuted">•</p>
            <p>{crisis.responses.length} orgs tracked</p>
            <p className="text-textMuted">•</p>
            <p>{formatRelativeTime(crisis.created_at)}</p>
          </div>

          <p className="truncate text-xs text-textMuted">{crisis.alert_text}</p>

          {expanded ? <CrisisDetail crisis={crisis} /> : null}
        </div>
      </div>
    </button>
  );
}
