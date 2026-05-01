"use client";

import type { CrisisDetail, SignalIntelligence, SignalSource } from "@/types/crisis";

function titleCase(value?: string): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatTime(timestamp?: string): string {
  if (!timestamp) {
    return "No timestamp";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "No timestamp";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncateQuote(text?: string, limit = 200): string {
  if (!text) {
    return '"No signal available."';
  }

  const trimmed = text.trim();
  if (trimmed.length <= limit) {
    return `"${trimmed}"`;
  }

  return `"${trimmed.slice(0, limit).trimEnd()}..."`;
}

function pickSource(sources: SignalIntelligence, ...keys: string[]): SignalSource | undefined {
  const sourceBag = sources as Record<string, unknown>;
  for (const key of keys) {
    const value = sourceBag[key];
    if (
      value &&
      typeof value === "object" &&
      "raw_text" in value &&
      typeof (value as SignalSource).raw_text === "string"
    ) {
      return value as SignalSource;
    }
  }
  return undefined;
}

function severityTone(severity?: string): string {
  switch ((severity || "").toLowerCase()) {
    case "critical":
      return "bg-danger/85 text-white border border-danger/60";
    case "high":
      return "bg-amber-600/85 text-amber-50 border border-amber-400/50";
    case "medium":
      return "bg-yellow-500/80 text-yellow-950 border border-yellow-300/50";
    default:
      return "bg-blue-500/80 text-blue-50 border border-blue-300/50";
  }
}

function confidenceTone(confidence?: string): string {
  switch ((confidence || "").toLowerCase()) {
    case "high":
      return "text-responseConfirmed";
    case "medium":
      return "text-pingSent";
    default:
      return "text-danger";
  }
}

function confidenceAgreement(confidence?: string): string {
  switch ((confidence || "").toLowerCase()) {
    case "high":
      return "3 of 4 sources agree";
    case "medium":
      return "2 of 4 sources agree";
    default:
      return "1 of 4 sources agree";
  }
}

function vulnerabilityTone(score: number): { color: string; description: string } {
  if (score > 70) {
    return { color: "text-danger", description: "High — elderly + language" };
  }
  if (score >= 40) {
    return { color: "text-amber-300", description: "Moderate — mixed access barriers" };
  }
  return { color: "text-responseConfirmed", description: "Lower — manageable vulnerability" };
}

function sourceTagTone(tag: "official" | "weather" | "news" | "ground"): string {
  switch (tag) {
    case "official":
      return "border border-blue-400/30 bg-blue-500/10 text-blue-200";
    case "weather":
      return "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
    case "news":
      return "border border-slate-400/30 bg-slate-400/10 text-slate-200";
    default:
      return "border border-amber-400/30 bg-amber-500/10 text-amber-200";
  }
}

function MetricCard({
  label,
  value,
  subtitle,
  valueClassName = "text-textPrimary",
}: {
  label: string;
  value: string | number;
  subtitle: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-sm border border-line bg-panelSoft px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-textMuted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-textMuted">{subtitle}</p>
    </div>
  );
}

function SourceBreakdownCard({
  icon,
  title,
  source,
  tag,
  tagLabel,
}: {
  icon: string;
  title: string;
  source?: SignalSource;
  tag: "official" | "weather" | "news" | "ground";
  tagLabel: string;
}) {
  return (
    <div className="rounded-sm border border-line bg-panelSoft px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-textPrimary">{title}</p>
            <p className="text-[11px] text-textMuted">{formatTime(source?.timestamp)}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-textSecondary">{truncateQuote(source?.raw_text)}</p>
      <div className="mt-3">
        <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${sourceTagTone(tag)}`}>
          {tagLabel}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <section className="border-t border-line bg-ink px-3 py-3">
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-sm bg-panelSoft" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="h-28 rounded-sm bg-panelSoft" />
          <div className="h-28 rounded-sm bg-panelSoft" />
          <div className="h-28 rounded-sm bg-panelSoft" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="h-36 rounded-sm bg-panelSoft" />
          <div className="h-36 rounded-sm bg-panelSoft" />
          <div className="h-36 rounded-sm bg-panelSoft" />
          <div className="h-36 rounded-sm bg-panelSoft" />
        </div>
        <div className="h-28 rounded-sm bg-panelSoft" />
      </div>
    </section>
  );
}

export function SignalIntelligencePanel({
  crisis,
  sources,
  loading,
  error,
}: {
  crisis: CrisisDetail;
  sources: SignalIntelligence | null;
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <section className="border-t border-line bg-ink px-3 py-3">
        <div className="rounded-sm border border-danger/30 bg-danger/10 px-3 py-3 text-sm text-textSecondary">
          <p className="font-medium text-danger">Signal intelligence temporarily unavailable</p>
          <p className="mt-1 text-textMuted">{error}</p>
        </div>
      </section>
    );
  }

  if (!sources) {
    return (
      <section className="border-t border-line bg-ink px-3 py-3">
        <div className="rounded-sm border border-line bg-panelSoft px-3 py-3 text-sm text-textMuted">
          No signal intelligence available for this crisis yet.
        </div>
      </section>
    );
  }

  const fema = pickSource(sources, "fema", "FEMA", "fema_signal");
  const weather = pickSource(sources, "weather", "weather_gov", "Weather.gov", "weather_signal");
  const news = pickSource(sources, "news", "News", "news_signal");
  const social = pickSource(sources, "social", "Social", "social_signal");
  const sourceNames = [
    fema ? "FEMA" : null,
    weather ? "Weather" : null,
    news ? "News" : null,
    social ? "Social" : null,
  ].filter(Boolean) as string[];
  const sourceCount = sources.source_count ?? sourceNames.length;
  const confidence = titleCase(sources.signal_confidence);
  const vulnerabilityScore = crisis.community_profile?.vulnerability_score ?? sources.vulnerability_score ?? 0;
  const vulnerability = vulnerabilityTone(vulnerabilityScore);
  const escalationBody =
    sources.escalation_reason ||
    "FEMA reports 'moderate severity' but Weather.gov and social signals indicate conditions are more severe. CrisisCompass has escalated severity to CRITICAL based on ground truth signals.";

  return (
    <section className="border-t border-line bg-ink px-3 py-3">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 rounded-sm border border-line bg-panelSoft px-3 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-textPrimary">
              Crisis Intelligence — {crisis.location}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${severityTone(crisis.severity)}`}>
              ● {crisis.severity.toUpperCase()} — {titleCase(crisis.crisis_type)}
            </span>
            <button
              type="button"
              tabIndex={-1}
              className="rounded-sm border border-line px-2 py-1 text-sm text-textMuted"
              aria-label="More options"
            >
              ...
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <MetricCard
            label="Sources Ingested"
            value={sourceCount}
            subtitle={sourceNames.join(", ") || "No sources available"}
          />
          <MetricCard
            label="Signal Confidence"
            value={confidence}
            subtitle={confidenceAgreement(sources.signal_confidence)}
            valueClassName={confidenceTone(sources.signal_confidence)}
          />
          <MetricCard
            label="Vulnerability Score"
            value={`${vulnerabilityScore} / 100`}
            subtitle={vulnerability.description}
            valueClassName={vulnerability.color}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <SourceBreakdownCard
            icon="🏛️"
            title="FEMA IPAWS"
            source={fema}
            tag="official"
            tagLabel="Official alert"
          />
          <SourceBreakdownCard
            icon="🌧️"
            title="Weather.gov"
            source={weather}
            tag="weather"
            tagLabel="Weather service"
          />
          <SourceBreakdownCard
            icon="📰"
            title="News feed"
            source={news}
            tag="news"
            tagLabel="News report"
          />
          <SourceBreakdownCard
            icon="💬"
            title="Social media"
            source={social}
            tag="ground"
            tagLabel="Ground report"
          />
        </div>

        {sources.severity_escalation ? (
          <div className="rounded-sm border border-amber-500/30 border-l-4 border-l-amber-400 bg-amber-500/10 px-3 py-3">
            <div className="flex items-start gap-3">
              <span className="text-lg text-amber-300">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-100">Signal discrepancy detected</p>
                <p className="mt-1 text-xs leading-5 text-amber-50/90">{escalationBody}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-sm border border-blue-400/20 bg-blue-500/10 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200">
            AI-generated intelligence summary
          </p>
          <p className="mt-2 text-sm leading-6 text-textPrimary">
            {sources.unified_alert_text || "No AI summary available."}
          </p>
        </div>
      </div>
    </section>
  );
}
