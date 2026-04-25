import MapView, { Marker } from "react-native-maps";
import type { LocationResponse } from "../../api/locations";

type Props = {
  locations: LocationResponse[];
};

export default function HiddenGemsMap({ locations }: Props) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 36.653,
        longitude: -121.797,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
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
        />
      ))}
    </MapView>
  );
}