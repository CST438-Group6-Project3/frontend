import type { LocationResponse } from "../../api/locations";

type Props = {
  location: LocationResponse | null;
  onClose: () => void;
};

export default function LocationDetailsSheet({ location, onClose }: Props) {
  if (!location) return null;

  const mainImageUrl = location.imageUrls?.[0];

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
        overflowY: "auto",
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

        {mainImageUrl ? (
        <img
          src={mainImageUrl}
          alt={location.name}
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            borderRadius: 16,
            marginBottom: 20,
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 220,
            borderRadius: 16,
            marginBottom: 20,
            backgroundColor: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          No image yet
        </div>
      )}

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