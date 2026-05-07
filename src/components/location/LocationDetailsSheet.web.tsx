import React, { useEffect, useState } from "react";

interface Location {
  id: number;
  name: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  avgRating?: number;
  imageUrls?: string[];
}

interface Review {
  id?: number;
  userId: number;
  rating: number;
  text: string;
}

interface Props {
  location: Location | null;
  onClose: () => void;
}

function renderStars(rating: number) {
  const full = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return full + empty;
}

export default function LocationDetailsSheet({ location, onClose }: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

    const API_BASE_URL =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://YOUR-BACKEND-RENDER-URL.onrender.com";

    setIsLoadingReviews(true);
    setReviewsError(null);

    fetch(`${API_BASE_URL}/reviews/${location.id}`)
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

      <p>{location.description}</p>

      <p>
        <strong>Category:</strong> {location.category}
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
        <h3 style={{ marginBottom: 10 }}>Reviews</h3>

        {isLoadingReviews ? (
          <p>Loading reviews...</p>
        ) : reviewsError ? (
          <p style={{ color: "#dc2626", fontWeight: 700 }}>
            {reviewsError}
          </p>
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
              <p style={{ fontWeight: "bold", margin: 0 }}>
                User {review.userId} — {renderStars(review.rating)}
              </p>
              <p style={{ marginTop: 5 }}>{review.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}