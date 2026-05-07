import {
	Dimensions,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React from "react";
import { useState } from "react";
import type { LocationCategory, LocationResponse } from "../../api/locations";

type Props = {
	location: LocationResponse | null;
	canEditLocation?: boolean;
	isDeletingLocation?: boolean;
	deleteError?: string | null;
	onClose: () => void;
	onEditPress?: () => void;
	onDeleteConfirm?: () => void;
};

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

export default function LocationDetailsSheet({
	location,
	canEditLocation = false,
	isDeletingLocation = false,
	deleteError = null,
	onClose,
	onEditPress,
	onDeleteConfirm,
}: Props) {
	if (!location) return null;

	const imageUrls = location.imageUrls ?? [];
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [showDeleteWarning, setShowDeleteWarning] = useState(false);
	const screenWidth = Dimensions.get("window").width;
	const imageWidth = screenWidth - 48;

	return (
		<Modal
			visible={!!location}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<Pressable style={styles.backdrop} onPress={onClose} />

			<View style={styles.sheet}>
				<Pressable onPress={onClose} style={styles.handleArea}>
					<View style={styles.handle} />
				</Pressable>

				<Text style={styles.closeButton} onPress={onClose}>
					✕
				</Text>

				{imageUrls.length > 0 ? (
					<View style={styles.imageCarouselContainer}>
						<ScrollView
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							onMomentumScrollEnd={(event) => {
								const index = Math.round(
									event.nativeEvent.contentOffset.x / imageWidth
								);
								setCurrentImageIndex(index);
							}}
						>
							{imageUrls.map((url, index) => (
								<Image
									key={`${url}-${index}`}
									source={{ uri: url }}
									style={[styles.image, { width: imageWidth }]}
								/>
							))}
						</ScrollView>

						<View style={styles.imageCounter}>
							<Text style={styles.imageCounterText}>
								{currentImageIndex + 1}/{imageUrls.length}
							</Text>
						</View>
					</View>
				) : (
					<View style={styles.imagePlaceholder}>
						<Text style={styles.imagePlaceholderText}>No image yet</Text>
					</View>
				)}

				<Text style={styles.title}>{location.name}</Text>

				<Text style={styles.description}>
					{location.description || "No description yet."}
				</Text>

				<Text style={styles.text}>Category: {getCategoryLabel(location.category)}</Text>
				<Text style={styles.text}>Rating: {location.avgRating ?? 0}</Text>
				<Text style={styles.text}>
  					Coordinates: {location.lat}, {location.lng} 
				</Text>

				{canEditLocation && (
					<View style={styles.actions}>
						<Pressable style={styles.editButton} onPress={onEditPress}>
							<Text style={styles.editButtonText}>Edit location</Text>
						</Pressable>
						<Pressable
							style={styles.deleteButton}
							onPress={() => setShowDeleteWarning(true)}
						>
							<Text style={styles.deleteButtonText}>Delete location</Text>
						</Pressable>
					</View>
				)}

				<Modal
					visible={showDeleteWarning}
					transparent
					animationType="fade"
					onRequestClose={() => setShowDeleteWarning(false)}
				>
					<View style={styles.warningBackdrop}>
						<View style={styles.warningDialog}>
							<Text style={styles.warningTitle}>Delete location?</Text>
							<Text style={styles.warningText}>
								This action is not reversible. The location and its details
								would be permanently removed.
							</Text>
							{deleteError && (
								<Text style={styles.warningError}>{deleteError}</Text>
							)}
							<Pressable
								style={[
									styles.keepButton,
									isDeletingLocation && styles.actionButtonDisabled,
								]}
								onPress={() => setShowDeleteWarning(false)}
								disabled={isDeletingLocation}
							>
								<Text style={styles.keepButtonText}>Keep location</Text>
							</Pressable>
							<Pressable
								style={[
									styles.understandButton,
									isDeletingLocation && styles.actionButtonDisabled,
								]}
								onPress={onDeleteConfirm}
								disabled={isDeletingLocation}
							>
								<Text style={styles.understandButtonText}>
									{isDeletingLocation ? "Deleting..." : "Delete location"}
								</Text>
							</Pressable>
						</View>
					</View>
				</Modal>
			</View>
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
		height: 200,
		borderRadius: 16,
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
	imageCarouselContainer: {
		position: "relative",
		marginBottom: 16,
	},
	imageCounter: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "rgba(0,0,0,0.6)",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	imageCounterText: {
		color: "white",
		fontSize: 12,
		fontWeight: "700",
	},
	actions: {
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
		marginTop: 16,
		paddingTop: 16,
	},
	editButton: {
		width: "100%",
		borderRadius: 8,
		backgroundColor: "#111827",
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	editButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "700",
	},
	deleteButton: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#dc2626",
		borderRadius: 8,
		backgroundColor: "white",
		marginTop: 10,
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	deleteButtonText: {
		color: "#dc2626",
		fontSize: 16,
		fontWeight: "700",
	},
	warningBackdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(17,24,39,0.45)",
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	warningDialog: {
		width: "100%",
		maxWidth: 360,
		borderRadius: 12,
		backgroundColor: "white",
		padding: 22,
	},
	warningTitle: {
		color: "#111827",
		fontSize: 20,
		fontWeight: "800",
	},
	warningText: {
		color: "#4b5563",
		fontSize: 15,
		lineHeight: 22,
		marginTop: 10,
		marginBottom: 20,
	},
	warningError: {
		color: "#dc2626",
		fontSize: 14,
		fontWeight: "700",
		marginTop: -6,
		marginBottom: 14,
	},
	keepButton: {
		width: "100%",
		borderRadius: 8,
		backgroundColor: "#111827",
		paddingVertical: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	keepButtonText: {
		color: "white",
		fontSize: 15,
		fontWeight: "700",
	},
	understandButton: {
		width: "100%",
		marginTop: 10,
		paddingVertical: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	understandButtonText: {
		color: "#dc2626",
		fontSize: 15,
		fontWeight: "700",
	},
	actionButtonDisabled: {
		opacity: 0.65,
	},
});
