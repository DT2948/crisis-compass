"use client";

import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import type L from "leaflet";

import { StateBadge } from "@/components/StateBadge";
import type { CrisisDetail } from "@/types/crisis";

const STATE_COLORS: Record<CrisisDetail["response_state"], { fillColor: string; radius: number }> = {
  needs_identified: { fillColor: "#3B82F6", radius: 11 },
  ping_sent: { fillColor: "#EAB308", radius: 12 },
  response_confirmed: { fillColor: "#22C55E", radius: 14 },
  gap_flagged: { fillColor: "#EF4444", radius: 15 },
};

function markerStyle(state: CrisisDetail["response_state"]) {
  const stateStyle = STATE_COLORS[state];
  return {
    fillColor: stateStyle.fillColor,
    borderColor: stateStyle.fillColor,
    radius: stateStyle.radius,
  };
}

function isRecent(timestamp: string): boolean {
  const parsed = new Date(timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return Date.now() - parsed.getTime() <= 2 * 60_000;
}

export function MapMarker({
  crisis,
  selected,
  onViewDetails,
}: {
  crisis: CrisisDetail;
  selected: boolean;
  onViewDetails: (id: string) => void;
}) {
  const markerRef = useRef<L.CircleMarker | null>(null);
  const { fillColor, borderColor, radius } = markerStyle(crisis.response_state);
  const recent = isRecent(crisis.created_at);

  useEffect(() => {
    if (selected) {
      markerRef.current?.openPopup();
      return;
    }

    markerRef.current?.closePopup();
  }, [selected]);

  useEffect(() => {
    const element = markerRef.current?.getElement();
    if (!element) {
      return;
    }

    element.classList.toggle("veriti-marker-soft-pulse", recent);
  }, [recent]);

  const summaryPreview = useMemo(() => {
    return crisis.alert_text.length > 100
      ? `${crisis.alert_text.slice(0, 100)}...`
      : crisis.alert_text;
  }, [crisis.alert_text]);

  return (
    <CircleMarker
      ref={(instance) => {
        markerRef.current = instance;
      }}
      center={[crisis.coordinates.latitude, crisis.coordinates.longitude]}
      eventHandlers={{
        click: () => {
          onViewDetails(crisis.id);
        },
      }}
      radius={radius}
      pathOptions={{
        color: borderColor,
        fillColor,
        fillOpacity: selected ? 0.7 : 0.58,
        opacity: selected ? 0.84 : 0.74,
        stroke: false,
      }}
    >
      <Popup>
        <div className="w-52 space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-textPrimary">
              {crisis.location}
            </p>
            <StateBadge state={crisis.response_state} />
          </div>
          <div className="space-y-1 text-xs text-textSecondary">
            <p className="capitalize">{crisis.crisis_type.replaceAll("_", " ")}</p>
            <p>{crisis.responses.length} organizations tracked</p>
            <p className="text-textMuted">{summaryPreview}</p>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
