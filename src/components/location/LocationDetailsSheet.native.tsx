import {
	Image,
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

	const mainImageUrl = location.imageUrls?.[0];

	return (
		<Modal
			visible={!!location}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			{/* <View style={styles.modalRoot}> */}
			<Pressable style={styles.backdrop} onPress={onClose} />

			<View style={styles.sheet}>
				<Pressable onPress={onClose} style={styles.handleArea}>
					<View style={styles.handle} />
				</Pressable>

				<Text style={styles.closeButton} onPress={onClose}>
					✕
				</Text>

				{mainImageUrl ? (
					<Image source={{ uri: mainImageUrl }} style={styles.image} />
				) : (
					<View style={styles.imagePlaceholder}>
						<Text style={styles.imagePlaceholderText}>No image yet</Text>
					</View>
				)}

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
			{/* </View> */}
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.25)",
	},
	sheet: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		minHeight: 420,
		backgroundColor: "white",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 24,
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
		alignSelf: "center",
		marginBottom: 16,
	},
	closeButton: {
		position: "absolute",
		top: 16,
		right: 20,
		fontSize: 22,
		fontWeight: "700",
		zIndex: 10,
	},
	image: {
		width: "100%",
		height: 200,
		borderRadius: 16,
		marginBottom: 16,
	},
	imagePlaceholder: {
		width: "100%",
		height: 200,
		borderRadius: 16,
		marginBottom: 16,
		backgroundColor: "#e5e7eb",
		alignItems: "center",
		justifyContent: "center",
	},
	imagePlaceholderText: {
		color: "#6b7280",
		fontWeight: "600",
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