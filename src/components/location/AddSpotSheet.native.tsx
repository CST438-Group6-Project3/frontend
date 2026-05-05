import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  return (
    <Modal
      visible={!!coordinates}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      {coordinates && (
        <View style={styles.sheet}>
          <Pressable onPress={onClose} style={styles.handleArea}>
            <View style={styles.handle} />
          </Pressable>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Add spot</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={onNameChange}
              placeholder="e.g. Quiet courtyard"
              style={styles.input}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((option) => {
                const isActive = option.value === category;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onCategoryChange(option.value)}
                    style={[
                      styles.categoryButton,
                      isActive && styles.categoryButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        isActive && styles.categoryButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={onDescriptionChange}
              placeholder="What makes this spot useful?"
              multiline
              style={[styles.input, styles.textArea]}
            />

            <Text style={styles.label}>Coordinates</Text>
            <View style={styles.coordinatesBox}>
              <Text style={styles.coordinatesText}>
                Lat: {coordinates.lat.toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                Lng: {coordinates.lng.toFixed(6)}
              </Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
              onPress={onSubmit}
              disabled={isSaving}
            >
              <Text style={styles.submitButtonText}>
                {isSaving ? "Saving..." : "Create spot"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "86%",
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#ccc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  closeText: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
    color: "#374151",
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "white",
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  categoryButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  categoryButtonTextActive: {
    color: "white",
  },
  coordinatesBox: {
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    padding: 12,
    gap: 4,
  },
  coordinatesText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    marginTop: 12,
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "700",
  },
  submitButton: {
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: "#111827",
    paddingVertical: 13,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
  },
});
