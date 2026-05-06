import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import type { LocationResponse } from "../../api/locations";

const DEFAULT_US_REGION = {
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 32,
    longitudeDelta: 60,
};
const SEARCH_CENTER_VIEW_RADIUS_MILES = 100;
const MILES_PER_LATITUDE_DEGREE = 69;

type Props = {
    locations: LocationResponse[];
    onMarkerPress: (location: LocationResponse) => void;
    isPickingLocation?: boolean;
    onMapPress?: (coordinates: { lat: number; lng: number }) => void;
    searchCenter?: { lat: number; lng: number } | null;
};

export default function HiddenGemsMap({
    locations,
    onMarkerPress,
    isPickingLocation = false,
    onMapPress,
    searchCenter,
}: Props) {
    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
        if (!searchCenter) return;

        const latitudeDelta =
            (SEARCH_CENTER_VIEW_RADIUS_MILES * 2) / MILES_PER_LATITUDE_DEGREE;
        const latitudeRadians = (searchCenter.lat * Math.PI) / 180;
        const longitudeDelta =
            latitudeDelta / Math.max(Math.cos(latitudeRadians), 0.1);

        mapRef.current?.animateToRegion(
            {
                latitude: searchCenter.lat,
                longitude: searchCenter.lng,
                latitudeDelta,
                longitudeDelta,
            },
            350
        );
    }, [searchCenter]);

    return (
        <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={DEFAULT_US_REGION}
            onPress={(event: MapPressEvent) => {
                if (!isPickingLocation) return;

                const { latitude, longitude } = event.nativeEvent.coordinate;
                onMapPress?.({ lat: latitude, lng: longitude });
            }}
        >
            {locations.map((location) => (
                <Marker
                    key={location.id}
                    coordinate={{
                        latitude: location.lat,
                        longitude: location.lng,
                    }}
                    title={location.name}
                    description={location.category}
                    onPress={() => onMarkerPress(location)}
                />
            ))}

            {searchCenter && (
                <Marker
                    coordinate={{
                        latitude: searchCenter.lat,
                        longitude: searchCenter.lng,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    tracksViewChanges={false}
                >
                    <View style={styles.searchCenterMarker}>
                        <View style={styles.searchCenterDot} />
                    </View>
                </Marker>
            )}
        </MapView>
    );
}

const styles = StyleSheet.create({
    searchCenterMarker: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.18)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    searchCenterDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "white",
        backgroundColor: "#2563eb",
    },
});
