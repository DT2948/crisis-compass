"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import { MapMarker } from "@/components/MapMarker";
import type { CrisisDetail } from "@/types/crisis";

const PENNSYLVANIA_CENTER: [number, number] = [40.9, -77.8];
const PENNSYLVANIA_ZOOM = 7;

function MapController({
  selectedCrisis,
}: {
  selectedCrisis: CrisisDetail | null;
}) {
  const map = useMap();
  const previousSelectedId = useRef<string | null>(null);
  const previousCoordinates = useRef<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [map]);

  useEffect(() => {
    if (!selectedCrisis) {
      if (previousSelectedId.current) {
        map.flyTo(PENNSYLVANIA_CENTER, PENNSYLVANIA_ZOOM, {
          duration: 1,
        });
      }
      previousSelectedId.current = null;
      previousCoordinates.current = null;
      return;
    }

    const coordinateKey = `${selectedCrisis.coordinates.latitude}:${selectedCrisis.coordinates.longitude}`;
    const selectionChanged =
      previousSelectedId.current !== selectedCrisis.id ||
      previousCoordinates.current !== coordinateKey;

    if (!selectionChanged) {
      return;
    }

    map.flyTo(
      [selectedCrisis.coordinates.latitude, selectedCrisis.coordinates.longitude],
      9,
      { duration: 1.1 },
    );
    previousSelectedId.current = selectedCrisis.id;
    previousCoordinates.current = coordinateKey;
  }, [
    map,
    selectedCrisis?.id,
    selectedCrisis?.coordinates.latitude,
    selectedCrisis?.coordinates.longitude,
  ]);

  return null;
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
  const selectedCrisis =
    crises.find((crisis) => crisis.id === selectedCrisisId) ?? null;

  return (
    <div className="relative h-full min-h-0 overflow-hidden border border-line bg-panel">
      <div className="absolute inset-0">
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
          <MapController selectedCrisis={selectedCrisis} />
          {crises.map((crisis) => (
            <MapMarker
              key={crisis.id}
              crisis={crisis}
              selected={selectedCrisisId === crisis.id}
              onViewDetails={onSelectCrisis}
            />
          ))}
        </MapContainer>
      </div>
      <div className="map-tone-overlay" />
    </div>
  );
}
