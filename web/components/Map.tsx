"use client";

import { divIcon, type DivIcon } from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { CrisisDetail } from "@/types/crisis";

const PENNSYLVANIA_CENTER: [number, number] = [40.9, -77.8];
const PENNSYLVANIA_ZOOM = 7;

function createMarkerIcon(crisisType: CrisisDetail["crisis_type"], selected: boolean): DivIcon {
  return divIcon({
    className: "",
    html: `<div class="crisis-marker ${crisisType} ${selected ? "is-selected" : ""}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function CrisisMap({
  crises,
  selectedCrisisId,
  onSelectCrisis,
}: {
  crises: CrisisDetail[];
  selectedCrisisId: string | null;
  onSelectCrisis: (crisisId: string) => void;
}) {
  const markers = useMemo(
    () =>
      crises.map((crisis) => ({
        crisis,
        icon: createMarkerIcon(crisis.crisis_type, crisis.id === selectedCrisisId),
      })),
    [crises, selectedCrisisId],
  );

  return (
    <MapContainer
      center={PENNSYLVANIA_CENTER}
      zoom={PENNSYLVANIA_ZOOM}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(({ crisis, icon }) => (
        <Marker
          key={crisis.id}
          position={[crisis.coordinates.latitude, crisis.coordinates.longitude]}
          icon={icon}
          eventHandlers={{
            click: () => onSelectCrisis(crisis.id),
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
                {crisis.crisis_type.replaceAll("_", " ")}
              </p>
              <h3 className="mt-1 text-sm font-semibold">{crisis.location}</h3>
              <p className="mt-2 text-xs leading-5 text-muted">{crisis.alert_text}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
