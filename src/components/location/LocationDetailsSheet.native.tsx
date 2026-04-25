import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { LocationResponse } from "../../api/locations";

type Props = {
    location: LocationResponse | null;
    onClose: () => void;
};

export default function LocationDetailsSheet({ location, onClose }: Props) {
    if (!location) return null;

    return (
        <Modal
            visible={!!location}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalRoot}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.sheet}>
                    <Pressable onPress={onClose} style={styles.handleArea}>
                        <View style={styles.handle} />
                    </Pressable>

                    <Text style={styles.closeButton} onPress={onClose}>
                        ✕
                    </Text>

                    <Text style={styles.title}>{location.name}</Text>

                    <Text style={styles.description}>
                        {location.description || "No description yet."}
                    </Text>

                    <Text style={styles.text}>Category: {location.category}</Text>
                    <Text style={styles.text}>Rating: {location.avgRating ?? 0}</Text>
                    <Text style={styles.text}>
                        Coordinates: {location.lat}, {location.lng}
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    backgroundColor: "white",
    minHeight: 320,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    zIndex: 2,
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: -8,
    marginBottom: 8,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#ccc",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    fontSize: 22,
    fontWeight: "700",
    zIndex: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    marginBottom: 8,
  },
});