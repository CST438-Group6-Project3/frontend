import MapView, { Marker, MapPressEvent } from "react-native-maps";
import type { LocationResponse } from "../../api/locations";

type Props = {
    locations: LocationResponse[];
    onMarkerPress: (location: LocationResponse) => void;
    isPickingLocation?: boolean;
    onMapPress?: (coordinates: { lat: number; lng: number }) => void;
};

export default function HiddenGemsMap({
    locations,
    onMarkerPress,
    isPickingLocation = false,
    onMapPress,
}: Props) {
    return (
        <MapView
            style={{ flex: 1 }}
            initialRegion={{
                latitude: 36.653,
                longitude: -121.797,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
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
        </MapView>
    );
}
