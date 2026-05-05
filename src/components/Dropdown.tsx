import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Dropdown({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const navigation = useNavigation<any>();

  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={styles.dropdown}>
        <Pressable
          style={styles.item}
          onPress={() => {
            onClose();
            navigation.navigate("Profile");
          }}
        >
          <Text>Profile</Text>
        </Pressable>

        <Pressable style={styles.item}>
          <Text>Settings</Text>
        </Pressable>

        <Pressable style={styles.item}>
          <Text style={{ color: "red" }}>Logout</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },

  dropdown: {
    position: "absolute",
    top: 70,
    right: 16,
    width: 170,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,

    zIndex: 9999,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});