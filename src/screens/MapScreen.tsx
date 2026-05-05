import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
    Image,
} from "react-native";
import { getLocations, LocationResponse } from "../api/locations";
import HiddenGemsMap from "../components/map";
import LocationDetailsSheet from "../components/location";
import DashboardPanel from "../components/DashboardPanel";
import { useAuth } from "../../auth/AuthProvider";
import Dropdown from "../components/Dropdown";

export default function MapScreen() {
    const [locations, setLocations] = useState<LocationResponse[]>([]);
    const [selectedLocation, setSelectedLocation] =
        useState<LocationResponse | null>(null);
    const [detailsLocation, setDetailsLocation] =
        useState<LocationResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [dashboardOpen, setDashboardOpen] = useState(false);

    const { user } = useAuth();

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
        if (detailsLocation) {
            setDetailsLocation(location);
            setSelectedLocation(null);
        } else {
            setSelectedLocation(location);
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
            />

            <View style={styles.overlayContainer}>
                
                <Pressable
                    style={styles.avatarButton}
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
                <Dropdown
                    visible={dropdownOpen}
                    onClose={() => setDropdownOpen(false)}
                />

                {selectedLocation && (
                    <Pressable
                        style={styles.previewCard}
                        onPress={() => {
                            setDetailsLocation(selectedLocation);
                            setSelectedLocation(null);
                        }}
                    >
                        <View style={styles.previewContent}>
                            <View style={styles.previewTextContainer}>
                                <Text style={styles.previewTitle}>
                                    {selectedLocation.name}
                                </Text>
                                <Text style={styles.previewText}>
                                    {selectedLocation.category}
                                </Text>
                                <Text style={styles.previewText}>
                                    Rating: {selectedLocation.avgRating ?? 0}
                                </Text>
                            </View>

                            <Text style={styles.chevron}>›</Text>
                        </View>
                    </Pressable>
                )}

                <DashboardPanel
                    visible={dashboardOpen}
                    onClose={() => setDashboardOpen(false)}
                />
            </View>

            <LocationDetailsSheet
                location={detailsLocation}
                onClose={() => setDetailsLocation(null)}
            />
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
        zIndex: 99999,
        elevation: 50,
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

    /* 👤 AVATAR */
    avatarButton: {
        position: "absolute",
        top: 15,
        right: 20,
        zIndex: 100000,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "white",
        backgroundColor: "#eee",

        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },

    /* 📍 PREVIEW CARD */
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
    },

    previewContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    previewTextContainer: {
        flex: 1,
    },

    previewTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    previewText: {
        fontSize: 14,
        marginTop: 4,
    },

    chevron: {
        fontSize: 28,
        fontWeight: "700",
        color: "#6b7280",
        marginLeft: 12,
    },
});