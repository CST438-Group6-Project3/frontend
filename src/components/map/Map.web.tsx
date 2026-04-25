import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
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
};

export default function HiddenGemsMap({ locations }: HiddenGemsMapProps) {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={[36.653, -121.797]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker key={location.id} position={[location.lat, location.lng]}>
            <Popup>
              <strong>{location.name}</strong>
              <br />
              {location.category}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}