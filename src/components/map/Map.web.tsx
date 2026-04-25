// @ts-ignore: side-effect import for Leaflet CSS without type declarations
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { LocationResponse } from "../../api/locations";

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