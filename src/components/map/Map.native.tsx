import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, MapPressEvent, Region } from "react-native-maps";
import type { LocationCategory, LocationResponse } from "../../api/locations";

const DEFAULT_US_REGION = {
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 32,
    longitudeDelta: 60,
};
const SEARCH_CENTER_VIEW_RADIUS_MILES = 100;
const MILES_PER_LATITUDE_DEGREE = 69;
const METERS_PER_MILE = 1609.344;
const LOCATION_MARKER_Z_INDEX = 1000;
const SEARCH_CENTER_MARKER_Z_INDEX = 1;

const CATEGORY_LABELS: Record<LocationCategory, string> = {
    study_spot: "Study",
    food: "Food",
    scenic: "Scenic",
    hangout: "Hangout",
    trail: "Trail",
    activity: "Activity",
    other: "Other",
};

function getCategoryLabel(category: LocationCategory) {
    return CATEGORY_LABELS[category] ?? category;
}

type Props = {
    locations: LocationResponse[];
    onMarkerPress: (location: LocationResponse) => void;
    isPickingLocation?: boolean;
    isPickingSearchCenter?: boolean;
    onMapPress?: (coordinates: { lat: number; lng: number }) => void;
    onCameraCenterChange?: (coordinates: { lat: number; lng: number }) => void;
    searchCenter?: { lat: number; lng: number } | null;
    searchRadiusMiles?: number;
};

export default function HiddenGemsMap({
    locations,
    onMarkerPress,
    isPickingLocation = false,
    isPickingSearchCenter = false,
    onMapPress,
    onCameraCenterChange,
    searchCenter,
    searchRadiusMiles,
}: Props) {
    const mapRef = useRef<MapView | null>(null);
    const currentRegionRef = useRef(DEFAULT_US_REGION);

    useEffect(() => {
        if (!searchCenter) return;

        const latitudeDelta =
            (SEARCH_CENTER_VIEW_RADIUS_MILES * 2) / MILES_PER_LATITUDE_DEGREE;
        const latitudeRadians = (searchCenter.lat * Math.PI) / 180;
        const longitudeDelta =
            latitudeDelta / Math.max(Math.cos(latitudeRadians), 0.1);
        const currentRegion = currentRegionRef.current;

        mapRef.current?.animateToRegion(
            {
                latitude: searchCenter.lat,
                longitude: searchCenter.lng,
                latitudeDelta: Math.min(currentRegion.latitudeDelta, latitudeDelta),
                longitudeDelta: Math.min(currentRegion.longitudeDelta, longitudeDelta),
            },
            350
        );
    }, [searchCenter]);

    return (
        <View style={styles.container}>
        <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={DEFAULT_US_REGION}
            onRegionChangeComplete={(region: Region) => {
                currentRegionRef.current = region;
                onCameraCenterChange?.({
                    lat: region.latitude,
                    lng: region.longitude,
                });
            }}
            onPress={(event: MapPressEvent) => {
                if (!isPickingLocation) return;

                const { latitude, longitude } = event.nativeEvent.coordinate;
                onMapPress?.({ lat: latitude, lng: longitude });
            }}
        >
            {!isPickingLocation &&
                locations.map((location) => (
                    <Marker
                        key={location.id}
                        coordinate={{
                            latitude: location.lat,
                            longitude: location.lng,
                        }}
                        title={location.name}
                        description={getCategoryLabel(location.category)}
                        zIndex={LOCATION_MARKER_Z_INDEX}
                        onPress={() => onMarkerPress(location)}
                    />
                ))}

            {searchCenter && (
                <>
                    {searchRadiusMiles && (
                        <Circle
                            center={{
                                latitude: searchCenter.lat,
                                longitude: searchCenter.lng,
                            }}
                            radius={searchRadiusMiles * METERS_PER_MILE}
                            strokeColor="rgba(37, 99, 235, 0.35)"
                            fillColor="rgba(37, 99, 235, 0.06)"
                            strokeWidth={1}
                        />
                    )}
                    <Marker
                        coordinate={{
                            latitude: searchCenter.lat,
                            longitude: searchCenter.lng,
                        }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        zIndex={SEARCH_CENTER_MARKER_Z_INDEX}
                        onPress={() => undefined}
                    >
                        <View pointerEvents="none" style={styles.searchCenterMarker}>
                            <View style={styles.searchCenterDot} />
                        </View>
                    </Marker>
                </>
            )}
        </MapView>
            {isPickingSearchCenter && (
                <View pointerEvents="none" style={styles.centerPickerCrosshair}>
                    <View style={styles.centerPickerVertical} />
                    <View style={styles.centerPickerHorizontal} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    map: {
        flex: 1,
    },
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
    centerPickerCrosshair: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 28,
        height: 28,
        marginLeft: -14,
        marginTop: -14,
        alignItems: "center",
        justifyContent: "center",
    },
    centerPickerVertical: {
        position: "absolute",
        width: 3,
        height: 28,
        borderRadius: 999,
        backgroundColor: "rgba(17, 24, 39, 0.55)",
    },
    centerPickerHorizontal: {
        position: "absolute",
        width: 28,
        height: 3,
        borderRadius: 999,
        backgroundColor: "rgba(17, 24, 39, 0.55)",
    },
});
