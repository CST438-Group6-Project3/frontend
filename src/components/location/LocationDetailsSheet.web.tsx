import React, { useEffect, useState } from "react";
import type { LocationCategory, LocationResponse } from "../../api/locations";

type Props = {
  location: LocationResponse | null;
  canEditLocation?: boolean;
  isDeletingLocation?: boolean;
  deleteError?: string | null;
  onClose: () => void;
  onEditPress?: () => void;
  onDeleteConfirm?: () => void;
};

type Review = {
  id: number;
  userId: number;
  locationId: number;
  rating: number;
  text: string;
  upvotes?: number;
  downvotes?: number;
  createdAt?: string;
};

const CATEGORY_LABELS: Record<LocationCategory, string> = {
  study_spot: "Study",
  food: "Food",
  scenic: "Scenic",
  hangout: "Hangout",
  trail: "Trail",
  activity: "Activity",
  other: "Other",
};

function getCategoryLabel(category: LocationCategory) {
  return CATEGORY_LABELS[category] ?? category;
}

function renderStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

export default function LocationDetailsSheet({
  location,
  canEditLocation = false,
  isDeletingLocation = false,
  deleteError = null,
  onClose,
  onEditPress,
  onDeleteConfirm,
}: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedImageIndex(0);
    setReviews([]);
    setReviewsError(null);
  }, [location?.id]);

  useEffect(() => {
    if (!location?.id) return;

    setIsLoadingReviews(true);
    setReviewsError(null);

    fetch(`http://localhost:8080/reviews/${location.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load reviews");
        }
        return res.json();
      })
      .then((data: Review[]) => {
        setReviews(data);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
        setReviews([]);
        setReviewsError("Could not load reviews.");
      })
      .finally(() => {
        setIsLoadingReviews(false);
      });
  }, [location?.id]);

  if (!location) return null;

  const imageUrls = location.imageUrls ?? [];
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
        <strong>Category:</strong> {getCategoryLabel(location.category)}
      </p>

      <p>
        <strong>Rating:</strong> {location.avgRating ?? 0}
      </p>

      <p>
        <strong>Coordinates:</strong> {location.lat}, {location.lng}
      </p>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          marginTop: 20,
          paddingTop: 16,
        }}
      >
        <h1 style={{ color: "red", fontSize: 40 }}>REVIEWS TEST</h1>
        {isLoadingReviews ? (
          <p>Loading reviews...</p>
        ) : reviewsError ? (
          <p style={{ color: "#dc2626", fontWeight: 700 }}>{reviewsError}</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id ?? `${review.userId}-${review.text}`}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                backgroundColor: "#f9fafb",
              }}
            >
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: 18,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                {renderStars(review.rating)}
              </div>

              <p style={{ margin: "4px 0 8px" }}>{review.text}</p>

              <small style={{ color: "#6b7280" }}>
                User {review.userId} · {review.rating}/5
              </small>
            </div>
          ))
        )}
      </div>

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
              This action is not reversible. The location and its details would
              be permanently removed.
            </p>
            {deleteError && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 14,
                  marginTop: -6,
                }}
              >
                {deleteError}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteWarning(false)}
              disabled={isDeletingLocation}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 8,
                backgroundColor: "#111827",
                color: "white",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
                opacity: isDeletingLocation ? 0.65 : 1,
                padding: "12px 14px",
              }}
            >
              Keep location
            </button>
            <button
              type="button"
              onClick={onDeleteConfirm}
              disabled={isDeletingLocation}
              style={{
                width: "100%",
                border: "none",
                backgroundColor: "transparent",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
                marginTop: 10,
                opacity: isDeletingLocation ? 0.65 : 1,
                padding: "12px 14px",
              }}
            >
              {isDeletingLocation ? "Deleting..." : "Delete location"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
