import * as ImagePicker from "expo-image-picker";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  async function handlePickImages() {
    const remainingSlots = MAX_LOCATION_IMAGES - imageUrls.length;
    if (remainingSlots <= 0 || isUploadingImages) return;

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.85,
    });

    if (result.canceled) return;

    onAddImages(
      result.assets.map((asset, index) => ({
        uri: asset.uri,
        fileName:
          asset.fileName ??
          asset.uri.split("/").pop() ??
          `location-image-${index}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      }))
    );
  }

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

            <Text style={styles.label}>Images</Text>
            <Pressable
              style={[
                styles.uploadButton,
                (imageUrls.length >= MAX_LOCATION_IMAGES || isUploadingImages) &&
                styles.uploadButtonDisabled,
              ]}
              onPress={handlePickImages}
              disabled={imageUrls.length >= MAX_LOCATION_IMAGES || isUploadingImages}
            >
              <Text style={styles.uploadButtonText}>
                {isUploadingImages
                  ? "Uploading..."
                  : `Upload images (${imageUrls.length}/${MAX_LOCATION_IMAGES})`}
              </Text>
            </Pressable>

            {imageUrls.length > 0 && (
              <View style={styles.imageGrid}>
                {imageUrls.map((imageUrl) => (
                  <View key={imageUrl} style={styles.imagePreview}>
                    <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                    <Pressable
                      onPress={() => onRemoveImage(imageUrl)}
                      style={styles.removeImageButton}
                    >
                      <Text style={styles.removeImageText}>x</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[
                styles.submitButton,
                (isSaving || isUploadingImages) && styles.submitButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={isSaving || isUploadingImages}
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
  uploadButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9ca3af",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  imagePreview: {
    position: "relative",
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(17,24,39,0.86)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: "white",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
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
