import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuth } from "../../auth/AuthProvider";
import {
    createLocation,
    deleteLocation,
    getApiErrorMessage,
    getLocations,
    LocationCategory,
    LocationResponse,
    updateLocation,
} from "../api/locations";
import {
    MAX_LOCATION_IMAGES,
    SpotImageUpload,
    uploadLocationImages,
} from "../api/imageUploads";
import HiddenGemsMap from "../components/map";
import AddSpotSheet from "../components/location/AddSpotSheet";
import LocationDetailsSheet from "../components/location";
import EditLocationSheet from "../components/location/EditLocationSheet";

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
    const [newSpotImageUrls, setNewSpotImageUrls] = useState<string[]>([]);
    const [isSavingSpot, setIsSavingSpot] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [editingLocation, setEditingLocation] =
        useState<LocationResponse | null>(null);
    const [editLocationName, setEditLocationName] = useState("");
    const [editLocationDescription, setEditLocationDescription] = useState("");
    const [editLocationCategory, setEditLocationCategory] =
        useState<LocationCategory>("study_spot");
    const [editLocationImageUrls, setEditLocationImageUrls] = useState<string[]>([]);
    const [isSavingEditLocation, setIsSavingEditLocation] = useState(false);
    const [isUploadingEditImages, setIsUploadingEditImages] = useState(false);
    const [editLocationError, setEditLocationError] = useState<string | null>(null);
    const [isDeletingLocation, setIsDeletingLocation] = useState(false);
    const [deleteLocationError, setDeleteLocationError] = useState<string | null>(null);
    const canEditDetailsLocation = Boolean(
        detailsLocation &&
            user &&
            (detailsLocation.createdById === user.id || user.role === "admin")
    );

    useEffect(() => {
        async function loadLocations() {
            try {
                setLoading(true);
                setError(null);

                const data = await getLocations();
                setLocations(data);

                console.log("Loaded locations:", data);
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
        if (isPickingLocation) return;

        if (draftCoordinates) {
            resetAddSpotForm();
            setDetailsLocation(location);
            setSelectedLocation(null);
            return;
        }

        resetAddSpotForm();

        if (detailsLocation) {
            setDetailsLocation(location);
            setSelectedLocation(null);
        } else {
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
        setNewSpotImageUrls([]);
        setSaveError(null);
        setIsSavingSpot(false);
        setIsUploadingImages(false);
    }

    function startEditingLocation(location: LocationResponse) {
        setEditingLocation(location);
        setDetailsLocation(null);
        setSelectedLocation(null);
        setDraftCoordinates(null);
        setEditLocationName(location.name);
        setEditLocationDescription(location.description ?? "");
        setEditLocationCategory(location.category);
        setEditLocationImageUrls(location.imageUrls ?? []);
        setEditLocationError(null);
        setIsSavingEditLocation(false);
        setIsUploadingEditImages(false);
        setDeleteLocationError(null);
    }

    function resetEditLocationForm() {
        setEditingLocation(null);
        setEditLocationName("");
        setEditLocationDescription("");
        setEditLocationCategory("study_spot");
        setEditLocationImageUrls([]);
        setEditLocationError(null);
        setIsSavingEditLocation(false);
        setIsUploadingEditImages(false);
    }

    async function handleAddImages(images: SpotImageUpload[]) {
        if (!user?.id) {
            setSaveError("Sign in before uploading images.");
            return;
        }

        const remainingSlots = MAX_LOCATION_IMAGES - newSpotImageUrls.length;
        if (remainingSlots <= 0) {
            setSaveError(`You can upload up to ${MAX_LOCATION_IMAGES} images.`);
            return;
        }

        const imagesToUpload = images.slice(0, remainingSlots);
        if (images.length > remainingSlots) {
            setSaveError(`Only ${remainingSlots} more image(s) can be added.`);
        } else {
            setSaveError(null);
        }

        try {
            setIsUploadingImages(true);

            const uploadedUrls = await uploadLocationImages(imagesToUpload, user.id);
            setNewSpotImageUrls((currentUrls) => [...currentUrls, ...uploadedUrls]);
        } catch (err) {
            console.error("Failed to upload location images:", err);
            setSaveError(getApiErrorMessage(err));
        } finally {
            setIsUploadingImages(false);
        }
    }

    function handleRemoveImage(imageUrl: string) {
        setNewSpotImageUrls((currentUrls) =>
            currentUrls.filter((currentUrl) => currentUrl !== imageUrl)
        );
    }

    async function handleAddEditImages(images: SpotImageUpload[]) {
        if (!user?.id) {
            setEditLocationError("Sign in before uploading images.");
            return;
        }

        const remainingSlots = MAX_LOCATION_IMAGES - editLocationImageUrls.length;
        if (remainingSlots <= 0) {
            setEditLocationError(`You can upload up to ${MAX_LOCATION_IMAGES} images.`);
            return;
        }

        const imagesToUpload = images.slice(0, remainingSlots);
        if (images.length > remainingSlots) {
            setEditLocationError(`Only ${remainingSlots} more image(s) can be added.`);
        } else {
            setEditLocationError(null);
        }

        try {
            setIsUploadingEditImages(true);

            const uploadedUrls = await uploadLocationImages(imagesToUpload, user.id);
            setEditLocationImageUrls((currentUrls) => [
                ...currentUrls,
                ...uploadedUrls,
            ]);
        } catch (err) {
            console.error("Failed to upload edited location images:", err);
            setEditLocationError(getApiErrorMessage(err));
        } finally {
            setIsUploadingEditImages(false);
        }
    }

    function handleRemoveEditImage(imageUrl: string) {
        setEditLocationImageUrls((currentUrls) =>
            currentUrls.filter((currentUrl) => currentUrl !== imageUrl)
        );
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
                imageUrls: newSpotImageUrls,
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

    async function handleUpdateLocation() {
        if (!editingLocation) return;

        const trimmedName = editLocationName.trim();
        if (!trimmedName) {
            setEditLocationError("Add a name for this spot.");
            return;
        }

        try {
            setIsSavingEditLocation(true);
            setEditLocationError(null);

            const updatedLocation = await updateLocation(editingLocation.id, {
                name: trimmedName,
                description: editLocationDescription.trim(),
                category: editLocationCategory,
                imageUrls: editLocationImageUrls,
            });

            setLocations((currentLocations) =>
                currentLocations.map((location) =>
                    location.id === updatedLocation.id ? updatedLocation : location
                )
            );
            resetEditLocationForm();
            setDetailsLocation(updatedLocation);
        } catch (err) {
            console.error("Failed to update location:", err);
            setEditLocationError(getApiErrorMessage(err));
        } finally {
            setIsSavingEditLocation(false);
        }
    }

    async function handleDeleteLocation() {
        if (!detailsLocation || !canEditDetailsLocation) return;

        try {
            setIsDeletingLocation(true);
            setDeleteLocationError(null);

            await deleteLocation(detailsLocation.id);

            setLocations((currentLocations) =>
                currentLocations.filter((location) => location.id !== detailsLocation.id)
            );
            setSelectedLocation((currentLocation) =>
                currentLocation?.id === detailsLocation.id ? null : currentLocation
            );
            setDetailsLocation(null);
        } catch (err) {
            console.error("Failed to delete location:", err);
            setDeleteLocationError(getApiErrorMessage(err));
        } finally {
            setIsDeletingLocation(false);
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
                imageUrls={newSpotImageUrls}
                isSaving={isSavingSpot}
                isUploadingImages={isUploadingImages}
                error={saveError}
                onNameChange={setNewSpotName}
                onDescriptionChange={setNewSpotDescription}
                onCategoryChange={setNewSpotCategory}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                onSubmit={handleCreateSpot}
                onClose={resetAddSpotForm}
            />

            <LocationDetailsSheet
                location={draftCoordinates || editingLocation ? null : detailsLocation}
                canEditLocation={canEditDetailsLocation}
                isDeletingLocation={isDeletingLocation}
                deleteError={deleteLocationError}
                onClose={() => setDetailsLocation(null)}
                onEditPress={() => {
                    if (detailsLocation) startEditingLocation(detailsLocation);
                }}
                onDeleteConfirm={handleDeleteLocation}
            />

            <EditLocationSheet
                location={editingLocation}
                categories={CATEGORIES}
                name={editLocationName}
                description={editLocationDescription}
                category={editLocationCategory}
                imageUrls={editLocationImageUrls}
                isSaving={isSavingEditLocation}
                isUploadingImages={isUploadingEditImages}
                error={editLocationError}
                onNameChange={setEditLocationName}
                onDescriptionChange={setEditLocationDescription}
                onCategoryChange={setEditLocationCategory}
                onAddImages={handleAddEditImages}
                onRemoveImage={handleRemoveEditImage}
                onSubmit={handleUpdateLocation}
                onClose={resetEditLocationForm}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
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
        cursor: "pointer",
    },
    previewContent: {
        flexDirection: "row",
        alignItems: "center",
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
});
