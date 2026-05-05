import type { CSSProperties } from "react";
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
  name: string;
  description: string;
  category: LocationCategory;
  isSaving: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: LocationCategory) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function AddSpotSheet({
  coordinates,
  categories,
  name,
  description,
  category,
  isSaving,
  error,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onSubmit,
  onClose,
}: Props) {
  if (!coordinates) return null;

  return (
    <aside style={styles.sheet} aria-label="Add spot form">
      <div style={styles.header}>
        <h2 style={styles.title}>Add spot</h2>
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

      {error && <p style={styles.error}>{error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSaving}
        style={{
          ...styles.submitButton,
          ...(isSaving ? styles.submitButtonDisabled : null),
        }}
      >
        {isSaving ? "Saving..." : "Create spot"}
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
