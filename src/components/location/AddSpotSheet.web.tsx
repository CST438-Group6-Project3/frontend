import type { CSSProperties, ChangeEvent } from "react";
import { MAX_LOCATION_IMAGES, SpotImageUpload } from "../../api/imageUploads";
import type { LocationCategory } from "../../api/locations";

type Coordinates = {
  lat: number;
  lng: number;
};

type CategoryOption = {
  value: LocationCategory;
  label: string;
};

type Props = {
  coordinates: Coordinates | null;
  categories: CategoryOption[];
  title?: string;
  ariaLabel?: string;
  submitLabel?: string;
  savingLabel?: string;
  name: string;
  description: string;
  category: LocationCategory;
  imageUrls: string[];
  isSaving: boolean;
  isUploadingImages: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: LocationCategory) => void;
  onAddImages: (images: SpotImageUpload[]) => void;
  onRemoveImage: (imageUrl: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function AddSpotSheet({
  coordinates,
  categories,
  title = "Add spot",
  ariaLabel = "Add spot form",
  submitLabel = "Create spot",
  savingLabel = "Saving...",
  name,
  description,
  category,
  imageUrls,
  isSaving,
  isUploadingImages,
  error,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onAddImages,
  onRemoveImage,
  onSubmit,
  onClose,
}: Props) {
  if (!coordinates) return null;

  const canAddImages = imageUrls.length < MAX_LOCATION_IMAGES && !isUploadingImages;

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      onAddImages(
        files.map((file) => ({
          file,
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
        }))
      );
    }

    event.target.value = "";
  }

  return (
    <aside style={styles.sheet} aria-label={ariaLabel}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <button onClick={onClose} style={styles.closeButton} aria-label="Close">
          x
        </button>
      </div>

      <label style={styles.label} htmlFor="add-spot-name">
        Name
      </label>
      <input
        id="add-spot-name"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="e.g. Quiet courtyard"
        style={styles.input}
      />

      <span style={styles.label}>Category</span>
      <div style={styles.categoryGrid}>
        {categories.map((option) => {
          const isActive = option.value === category;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onCategoryChange(option.value)}
              style={{
                ...styles.categoryButton,
                ...(isActive ? styles.categoryButtonActive : null),
              }}
            >
              <span
                style={{
                  ...styles.categoryButtonText,
                  ...(isActive ? styles.categoryButtonTextActive : null),
                }}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <label style={styles.label} htmlFor="add-spot-description">
        Description
      </label>
      <textarea
        id="add-spot-description"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="What makes this spot useful?"
        style={{ ...styles.input, ...styles.textArea }}
      />

      <span style={styles.label}>Coordinates</span>
      <div style={styles.coordinatesBox}>
        <span>Lat: {coordinates.lat.toFixed(6)}</span>
        <span>Lng: {coordinates.lng.toFixed(6)}</span>
      </div>

      <span style={styles.label}>Images</span>
      <label
        style={{
          ...styles.uploadButton,
          ...(!canAddImages ? styles.uploadButtonDisabled : null),
        }}
      >
        {isUploadingImages
          ? "Uploading..."
          : `Upload images (${imageUrls.length}/${MAX_LOCATION_IMAGES})`}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={!canAddImages}
          onChange={handleImageChange}
          style={styles.fileInput}
        />
      </label>

      {imageUrls.length > 0 && (
        <div style={styles.imageGrid}>
          {imageUrls.map((imageUrl) => (
            <div key={imageUrl} style={styles.imagePreview}>
              <img src={imageUrl} alt="" style={styles.previewImage} />
              <button
                type="button"
                onClick={() => onRemoveImage(imageUrl)}
                style={styles.removeImageButton}
                aria-label="Remove image"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSaving || isUploadingImages}
        style={{
          ...styles.submitButton,
          ...(isSaving || isUploadingImages ? styles.submitButtonDisabled : null),
        }}
      >
        {isSaving ? savingLabel : submitLabel}
      </button>
    </aside>
  );
}

const styles: Record<string, CSSProperties> = {
  sheet: {
    position: "fixed",
    top: 0,
    right: 0,
    width: 390,
    maxWidth: "calc(100vw - 32px)",
    height: "100vh",
    backgroundColor: "white",
    padding: 24,
    boxShadow: "-4px 0 16px rgba(0,0,0,0.2)",
    zIndex: 10000,
    overflowY: "auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#111827",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    border: "none",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    cursor: "pointer",
    fontSize: 20,
    fontWeight: 800,
  },
  label: {
    display: "block",
    marginTop: 14,
    marginBottom: 7,
    color: "#374151",
    fontSize: 13,
    fontWeight: 800,
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "11px 12px",
    fontSize: 15,
    boxSizing: "border-box",
    outlineColor: "#2563eb",
  },
  textArea: {
    minHeight: 110,
    resize: "vertical",
    fontFamily: "inherit",
  },
  categoryGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    border: "1px solid #d1d5db",
    borderRadius: 999,
    padding: "8px 12px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  categoryButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  categoryButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: 700,
  },
  categoryButtonTextActive: {
    color: "white",
  },
  coordinatesBox: {
    display: "grid",
    gap: 4,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    padding: 12,
    color: "#374151",
    fontSize: 14,
    fontWeight: 600,
  },
  uploadButton: {
    position: "relative",
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed #9ca3af",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    color: "#111827",
    padding: "12px 14px",
    boxSizing: "border-box",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
    cursor: "default",
  },
  fileInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    marginTop: 10,
  },
  imagePreview: {
    position: "relative",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    border: "none",
    backgroundColor: "rgba(17,24,39,0.86)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    lineHeight: "24px",
    padding: 0,
  },
  error: {
    marginTop: 12,
    marginBottom: 0,
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 700,
  },
  submitButton: {
    width: "100%",
    marginTop: 20,
    border: "none",
    borderRadius: 10,
    backgroundColor: "#111827",
    color: "white",
    padding: "13px 16px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 800,
  },
  submitButtonDisabled: {
    opacity: 0.65,
    cursor: "default",
  },
};
