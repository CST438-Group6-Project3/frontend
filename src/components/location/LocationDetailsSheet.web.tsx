import type { LocationResponse } from "../../api/locations";

type Props = {
  location: LocationResponse | null;
  onClose: () => void;
};

export default function LocationDetailsSheet({ location, onClose }: Props) {
  if (!location) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 380,
        height: "100vh",
        backgroundColor: "white",
        padding: 24,
        boxShadow: "-4px 0 16px rgba(0,0,0,0.2)",
        zIndex: 10000,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          fontSize: 20,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <h2>{location.name}</h2>
      <p>{location.description || "No description yet."}</p>

      <p>
        <strong>Category:</strong> {location.category}
      </p>

      <p>
        <strong>Rating:</strong> {location.avgRating ?? 0}
      </p>

      <p>
        <strong>Coordinates:</strong> {location.lat}, {location.lng}
      </p>
    </div>
  );
}