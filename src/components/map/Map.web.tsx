import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LocationResponse } from "../../api/locations";

import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type HiddenGemsMapProps = {
  locations: LocationResponse[];
  onMarkerPress: (location: LocationResponse) => void;
  isPickingLocation?: boolean;
  onMapPress?: (coordinates: { lat: number; lng: number }) => void;
};

type HoverCoordinates = {
  lat: number;
  lng: number;
  x: number;
  y: number;
};

const addSpotCursor =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2717%27 height=%2717%27 viewBox=%270 0 17 17%27%3E%3Cpath d=%27M8.5 2v13M2 8.5h13%27 stroke=%27%23000%27 stroke-width=%272%27 stroke-linecap=%27round%27/%3E%3Cpath d=%27M8.5 2v13M2 8.5h13%27 stroke=%27%23fff%27 stroke-width=%271%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") 8 8, crosshair';

function MapClickHandler({
  enabled,
  onMapPress,
  onHover,
}: {
  enabled: boolean;
  onMapPress?: (coordinates: { lat: number; lng: number }) => void;
  onHover: (coordinates: HoverCoordinates | null) => void;
}) {
  const map = useMapEvents({
    click(event) {
      if (!enabled) return;
      onMapPress?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    mousemove(event) {
      if (!enabled) return;

      onHover({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        x: event.containerPoint.x,
        y: event.containerPoint.y,
      });
    },
    mouseout() {
      onHover(null);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    const cursor = enabled ? addSpotCursor : "";
    const cursorTargets = [
      container,
      ...Array.from(container.querySelectorAll<HTMLElement>(".leaflet-pane")),
    ];

    cursorTargets.forEach((target) => {
      target.style.cursor = cursor;
    });

    return () => {
      cursorTargets.forEach((target) => {
        target.style.cursor = "";
      });
    };
  }, [enabled, map]);

  return null;
}

export default function HiddenGemsMap({
  locations,
  onMarkerPress,
  isPickingLocation = false,
  onMapPress,
}: HiddenGemsMapProps) {
  const [hoverCoordinates, setHoverCoordinates] =
    useState<HoverCoordinates | null>(null);

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        cursor: isPickingLocation ? addSpotCursor : "grab",
      }}
    >
      <MapContainer
        center={[36.653, -121.797]}
        zoom={13}
        style={{
          height: "100%",
          width: "100%",
          cursor: isPickingLocation ? addSpotCursor : undefined,
        }}
      >
        <MapClickHandler
          enabled={isPickingLocation}
          onMapPress={onMapPress}
          onHover={setHoverCoordinates}
        />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker key={location.id}
            position={[location.lat, location.lng]}
            eventHandlers={{
              click: () => onMarkerPress(location),
            }}
          />
        ))}
      </MapContainer>

      {isPickingLocation && hoverCoordinates && (
        <div
          style={{
            position: "absolute",
            left: hoverCoordinates.x + 14,
            top: hoverCoordinates.y + 14,
            zIndex: 1000,
            pointerEvents: "none",
            borderRadius: 6,
            backgroundColor: "rgba(17, 24, 39, 0.92)",
            color: "white",
            padding: "6px 8px",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.35,
            boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
            whiteSpace: "nowrap",
          }}
        >
          <div>Lat: {hoverCoordinates.lat.toFixed(6)}</div>
          <div>Lng: {hoverCoordinates.lng.toFixed(6)}</div>
        </div>
      )}
    </div>
  );
}
