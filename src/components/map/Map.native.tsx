import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, MapPressEvent, Region } from "react-native-maps";
import type { LocationResponse } from "../../api/locations";

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

type Props = {
    locations: LocationResponse[];
    onMarkerPress: (location: LocationResponse) => void;
    isPickingLocation?: boolean;
    onMapPress?: (coordinates: { lat: number; lng: number }) => void;
    searchCenter?: { lat: number; lng: number } | null;
    searchRadiusMiles?: number;
};

export default function HiddenGemsMap({
    locations,
    onMarkerPress,
    isPickingLocation = false,
    onMapPress,
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
        <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={DEFAULT_US_REGION}
            onRegionChangeComplete={(region: Region) => {
                currentRegionRef.current = region;
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
                        description={location.category}
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
