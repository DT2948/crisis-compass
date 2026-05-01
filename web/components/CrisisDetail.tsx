import { StateBadge } from "@/components/StateBadge";
import type { CrisisDetail as Crisis } from "@/types/crisis";

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`);
  if (Number.isNaN(date.getTime())) {
    return "unknown time";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeNeeds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    if (value.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
    }

    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export function CrisisDetail({
  crisis,
  onConfirmResponse,
  confirmingResponseOrgId,
}: {
  crisis: Crisis;
  onConfirmResponse: (crisisId: string, orgId: string, needsCovered: string[]) => void;
  confirmingResponseOrgId: string | null;
}) {
  const topNeeds = normalizeNeeds(crisis.community_profile?.top_needs);
  const visibleResponses = crisis.responses.slice(0, 3);
  const hiddenResponseCount = Math.max(0, crisis.responses.length - visibleResponses.length);

  return (
    <div className="space-y-3 border-t border-line pt-2 text-xs text-textSecondary">
      <p className="leading-5 text-textSecondary">{crisis.alert_text}</p>

      {crisis.community_profile ? (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-textMuted">
            Community Profile
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-sm border border-line bg-panelSoft px-2 py-2">
              Vulnerability: {crisis.community_profile.vulnerability_score}
            </div>
            <div className="rounded-sm border border-line bg-panelSoft px-2 py-2">
              Population: {crisis.affected_population.toLocaleString("en-US")}
            </div>
            <div className="rounded-sm border border-line bg-panelSoft px-2 py-2">
              Elderly: {crisis.community_profile.elderly_pct}%
            </div>
            <div className="rounded-sm border border-line bg-panelSoft px-2 py-2">
              Non-English: {crisis.community_profile.spanish_speaking_pct}%
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-textMuted">
          Top Needs
        </p>
        <div className="flex flex-wrap gap-2">
          {topNeeds.length > 0 ? (
            topNeeds.map((need) => (
              <span
                key={need}
                className="rounded-sm border border-line bg-panelSoft px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-textSecondary"
              >
                {formatLabel(need)}
              </span>
            ))
          ) : (
            <p className="text-textMuted">No top needs available yet.</p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-textMuted">
          Response Tracker
        </p>
        <div className="space-y-2">
          {visibleResponses.map((response) => (
            <div key={response.id} className="rounded-sm border border-line bg-panelSoft px-2 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-textPrimary">{response.organization.name}</span>
                <StateBadge state={response.status} />
              </div>
              {response.status === "ping_sent" && response.org_id === "ORG002" ? (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => onConfirmResponse(crisis.id, response.org_id, response.needs_covered)}
                    disabled={confirmingResponseOrgId === response.org_id}
                    className="inline-flex items-center rounded-sm border border-responseConfirmed/35 bg-responseConfirmed/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-responseConfirmed transition hover:bg-responseConfirmed/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirmingResponseOrgId === response.org_id ? "Confirming..." : "Confirm Response"}
                  </button>
                </div>
              ) : null}
              <p className="mt-1 leading-5">
                {response.needs_covered.join(", ")} • {response.organization.capacity} capacity
              </p>
              <p className="mt-1 text-textMuted">
                Updated {formatRelativeTime(response.confirmed_at ?? response.pinged_at ?? crisis.created_at)}
              </p>
            </div>
          ))}
          {hiddenResponseCount > 0 ? (
            <p className="text-[11px] text-textMuted">
              and {hiddenResponseCount} more organizations notified
            </p>
          ) : null}
        </div>
      </div>

      {crisis.gap_alerts.length > 0 ? (
        <div className="gap-alert-reveal">
          <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-textMuted">
            Gap Alerts
          </p>
          <div className="space-y-2">
            {crisis.gap_alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-sm border border-gapFlagged/30 bg-danger/10 px-2 py-2"
              >
                <p className="font-medium text-danger">{alert.alert_message}</p>
                <p className="mt-1 leading-5 text-textSecondary">
                  {alert.escalation_recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {crisis.risk_flags.map((tag) => (
          <span
            key={tag}
            className="rounded-sm border border-line bg-panelSoft px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-textSecondary"
          >
            {formatLabel(tag)}
          </span>
        ))}
      </div>
    </div>
  );
}
