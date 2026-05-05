import { useState } from "react";
import type { LocationResponse } from "../../api/locations";

type Props = {
  location: LocationResponse | null;
  canEditLocation?: boolean;
  onClose: () => void;
};

export default function LocationDetailsSheet({
  location,
  canEditLocation = false,
  onClose,
}: Props) {
  if (!location) return null;

  const imageUrls = location.imageUrls ?? [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mainImageUrl = imageUrls[selectedImageIndex];

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
        <>
          <img
            src={mainImageUrl}
            alt={location.name}
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              borderRadius: 16,
              marginBottom: 12,
            }}
          />

          {imageUrls.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                marginBottom: 20,
              }}
            >
              {imageUrls.map((url, index) => (
                <img
                  key={url}
                  src={url}
                  alt={`${location.name} ${index + 1}`}
                  onClick={() => setSelectedImageIndex(index)}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 10,
                    cursor: "pointer",
                    border:
                      selectedImageIndex === index
                        ? "3px solid #2563eb"
                        : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          )}
        </>
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

      {canEditLocation && (
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            marginTop: 24,
            paddingTop: 20,
          }}
        >
          <button
            type="button"
            style={{
              width: "100%",
              border: "none",
              borderRadius: 8,
              backgroundColor: "#111827",
              color: "white",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              padding: "14px 16px",
            }}
          >
            Edit location
          </button>
        </div>
      )}
    </div>
  );
}
