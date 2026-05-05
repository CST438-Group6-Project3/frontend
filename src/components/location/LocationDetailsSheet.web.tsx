import React from "react";
import { useState } from "react";
import type { LocationResponse } from "../../api/locations";

type Props = {
  location: LocationResponse | null;
  canEditLocation?: boolean;
  onClose: () => void;
  onEditPress?: () => void;
};

export default function LocationDetailsSheet({
  location,
  canEditLocation = false,
  onClose,
  onEditPress,
}: Props) {
  if (!location) return null;

  const imageUrls = location.imageUrls ?? [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
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
            onClick={onEditPress}
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
          <button
            type="button"
            onClick={() => setShowDeleteWarning(true)}
            style={{
              width: "100%",
              border: "1px solid #dc2626",
              borderRadius: 8,
              backgroundColor: "white",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              marginTop: 10,
              padding: "14px 16px",
            }}
          >
            Delete location
          </button>
        </div>
      )}

      {showDeleteWarning && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-location-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(17,24,39,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 10001,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              borderRadius: 12,
              backgroundColor: "white",
              boxShadow: "0 18px 45px rgba(0,0,0,0.24)",
              padding: 22,
            }}
          >
            <h3
              id="delete-location-title"
              style={{
                margin: 0,
                color: "#111827",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              Delete location?
            </h3>
            <p
              style={{
                color: "#4b5563",
                fontSize: 15,
                lineHeight: 1.5,
                marginBottom: 20,
                marginTop: 10,
              }}
            >
              This action is not reversible. The location and its details would be
              permanently removed.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteWarning(false)}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 8,
                backgroundColor: "#111827",
                color: "white",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
                padding: "12px 14px",
              }}
            >
              Keep location
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteWarning(false)}
              style={{
                width: "100%",
                border: "none",
                backgroundColor: "transparent",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
                marginTop: 10,
                padding: "12px 14px",
              }}
            >
              I understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
