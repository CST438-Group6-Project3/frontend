import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getLocations, LocationResponse } from "../api/locations";
import HiddenGemsMap from "../components/map/Map";

export default function MapScreen() {
    const [locations, setLocations] = useState<LocationResponse[]>([]);
    const [selectedLocation, setSelectedLocation] =
        useState<LocationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        onMarkerPress={setSelectedLocation}
      />

      {selectedLocation && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{selectedLocation.name}</Text>
          <Text style={styles.previewText}>{selectedLocation.category}</Text>
          <Text style={styles.previewText}>
            Rating: {selectedLocation.avgRating ?? 0}
          </Text>
        </View>
      )}
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
    previewCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
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