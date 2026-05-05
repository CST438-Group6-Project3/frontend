import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { useAuth } from "../../auth/AuthProvider";
import {
  createLocation,
  getApiErrorMessage,
  getLocations,
  LocationCategory,
  LocationResponse,
} from "../api/locations";
import HiddenGemsMap from "../components/map";
import AddSpotSheet from "../components/location/AddSpotSheet";
import LocationDetailsSheet from "../components/location";
import Dropdown from "../components/Dropdown";

const CATEGORIES: { value: LocationCategory; label: string }[] = [
  { value: "study_spot", label: "Study" },
  { value: "food", label: "Food" },
  { value: "scenic", label: "Scenic" },
  { value: "hangout", label: "Hangout" },
  { value: "trail", label: "Trail" },
  { value: "activity", label: "Activity" },
  { value: "other", label: "Other" },
];

type DraftSpotCoordinates = {
  lat: number;
  lng: number;
};

export default function MapScreen() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsLocation, setDetailsLocation] =
    useState<LocationResponse | null>(null);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [draftCoordinates, setDraftCoordinates] =
    useState<DraftSpotCoordinates | null>(null);
  const [newSpotName, setNewSpotName] = useState("");
  const [newSpotDescription, setNewSpotDescription] = useState("");
  const [newSpotCategory, setNewSpotCategory] =
    useState<LocationCategory>("study_spot");
  const [isSavingSpot, setIsSavingSpot] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        console.error("Failed to load locations:", err);
        setError("Could not load locations.");
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  function handleMarkerPress(location: LocationResponse) {
    setDropdownOpen(false);
    if (isPickingLocation) return;

    if (draftCoordinates) {
      resetAddSpotForm();
      setDetailsLocation(location);
      setSelectedLocation(null);
      return;
    }

    resetAddSpotForm();

    if (detailsLocation) {
      // If details sheet is open → switch immediately
      setDetailsLocation(location);
      setSelectedLocation(null);
    } else {
      // Otherwise → show preview
      setSelectedLocation(location);
    }
  }

  function startPickingLocation() {
    setSelectedLocation(null);
    setDetailsLocation(null);
    setDraftCoordinates(null);
    setSaveError(null);
    setIsPickingLocation(true);
  }

  function handleMapPress(coordinates: DraftSpotCoordinates) {
    if (!isPickingLocation) return;

    setDetailsLocation(null);
    setSelectedLocation(null);
    setDraftCoordinates(coordinates);
    setIsPickingLocation(false);
    setSaveError(null);
  }

  function resetAddSpotForm() {
    setDraftCoordinates(null);
    setNewSpotName("");
    setNewSpotDescription("");
    setNewSpotCategory("study_spot");
    setSaveError(null);
    setIsSavingSpot(false);
  }

  async function handleCreateSpot() {
    if (!draftCoordinates) return;

    const trimmedName = newSpotName.trim();
    if (!trimmedName) {
      setSaveError("Add a name for this spot.");
      return;
    }

    if (!user?.id) {
      setSaveError("Sign in before adding a spot.");
      return;
    }

    try {
      setIsSavingSpot(true);
      setSaveError(null);

      const createdLocation = await createLocation({
        name: trimmedName,
        description: newSpotDescription.trim() || undefined,
        category: newSpotCategory,
        tags: [],
        imageUrls: [],
        lat: draftCoordinates.lat,
        lng: draftCoordinates.lng,
        createdById: user.id,
      });

      setLocations((currentLocations) => [...currentLocations, createdLocation]);
      resetAddSpotForm();
      setDetailsLocation(createdLocation);
    } catch (err) {
      console.error("Failed to create location:", err);
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSavingSpot(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Loading map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HiddenGemsMap
        locations={locations}
        onMarkerPress={handleMarkerPress}
        isPickingLocation={isPickingLocation}
        onMapPress={handleMapPress}
      />

      <View style={styles.overlayContainer} pointerEvents="box-none">

        <Pressable
          style={styles.avatarButton}
          pointerEvents="auto"
          onPress={() => setDropdownOpen(prev => !prev)}
        >
          <Image
            source={
              user?.avatar_url
                ? { uri: user.avatar_url }
                : require("../../assets/default-avatar.png")
            }
            style={styles.avatar}
          />
        </Pressable>

        <View pointerEvents="box-none">
          <Dropdown
            visible={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
          />
        </View>

        <Pressable
          style={[
            styles.addSpotButton,
            isPickingLocation && styles.addSpotButtonActive,
          ]}
          onPress={
            isPickingLocation
              ? () => setIsPickingLocation(false)
              : startPickingLocation
          }
        >
          <Text style={styles.addSpotButtonText}>
            {isPickingLocation ? "x" : "+"}
          </Text>
        </Pressable>

        {isPickingLocation && (
          <View style={styles.pickHint}>
            <Text style={styles.pickHintText}>Click the map to place a spot</Text>
          </View>
        )}

        {selectedLocation && (
          <Pressable
            style={styles.previewCard}
            pointerEvents="auto"
            onPress={() => {
              resetAddSpotForm();
              setDetailsLocation(selectedLocation);
              setSelectedLocation(null);
            }}
          >


            <View style={styles.previewContent}>
              <View style={styles.previewTextContainer}>
                <Text style={styles.previewTitle}>{selectedLocation.name}</Text>
                <Text style={styles.previewText}>{selectedLocation.category}</Text>
                <Text style={styles.previewText}>
                  Rating: {selectedLocation.avgRating ?? 0}
                </Text>
              </View>

              <Text style={styles.chevron}>{">"}</Text>
            </View>
          </Pressable>
        )}

        <AddSpotSheet
          coordinates={draftCoordinates}
          categories={CATEGORIES}
          name={newSpotName}
          description={newSpotDescription}
          category={newSpotCategory}
          isSaving={isSavingSpot}
          error={saveError}
          onNameChange={setNewSpotName}
          onDescriptionChange={setNewSpotDescription}
          onCategoryChange={setNewSpotCategory}
          onSubmit={handleCreateSpot}
          onClose={resetAddSpotForm}
        />

        <LocationDetailsSheet
          location={draftCoordinates ? null : detailsLocation}
          onClose={() => setDetailsLocation(null)}
        />
      </View>
    </View>
  );
}

      const styles = StyleSheet.create({
        container: {
        flex: 1,
      position: "relative",
  },

      overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: "box-none",
      zIndex: 10000,
      elevation: 10000,
  },

      center: {
        flex: 1,
      alignItems: "center",
      justifyContent: "center",
  },

      text: {
        fontSize: 16,
      marginTop: 8,
  },

      error: {
        fontSize: 16,
      color: "red",
  },
      addSpotButton: {
        position: "absolute",
      right: 18,
      bottom: 28,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#111827",
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 10000,
    },
      addSpotButtonActive: {
        backgroundColor: "#2563eb",
    },
      addSpotButtonText: {
        color: "white",
      fontSize: 34,
      lineHeight: 38,
      fontWeight: "700",
    },
      pickHint: {
        position: "absolute",
      right: 86,
      bottom: 36,
      backgroundColor: "#111827",
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      zIndex: 9999,
    },
      pickHintText: {
        color: "white",
      fontSize: 14,
      fontWeight: "700",
    },
      avatarButton: {
        position: "absolute",
      top: 15,
      right: 20,
      zIndex: 10001,
  },

      avatar: {
        width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: "white",
      backgroundColor: "#eee",
  },
      previewCard: {
        position: "absolute",
      left: 16,
      right: 16,
      bottom: 24,
      backgroundColor: "white",
      borderRadius: 16,
      padding: 16,

      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,

      zIndex: 9999,
      cursor: "pointer"
  },

      previewContent: {
        flexDirection: "row",
      alignItems: "center", // 👈 key fix
      justifyContent: "space-between",
  },

      previewTextContainer: {
        flex: 1,
  },

      chevron: {
        fontSize: 28,
      fontWeight: "700",
      color: "#6b7280",
      marginLeft: 12,
  },
      previewTitle: {
        fontSize: 18,
      fontWeight: "700",
  },
      previewText: {
        fontSize: 14,
      marginTop: 4,
  },
      closeButton: {
        position: "absolute",
      top: 10,
      right: 14,
      fontSize: 20,
      fontWeight: "700",
      zIndex: 10000,
  },
      detailsButton: {
        marginTop: 12,
      fontSize: 16,
      fontWeight: "700",
      color: "#2563eb",
  },
});
