import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabaseClient";

export default function Dropdown({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const navigation = useNavigation<any>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setIsAdmin(data?.role === "admin");
    } catch (err) {
      console.error("Admin check failed:", err);
    }
  }

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable style={styles.closeArea} onPress={onClose} />

      <View style={styles.dropdown} pointerEvents="auto">
        <Pressable
          style={styles.item}
          onPress={() => {
            onClose();
            navigation.navigate("Profile");
          }}
        >
          <Text>Profile</Text>
        </Pressable>

        {isAdmin && (
          <Pressable
            style={styles.item}
            onPress={() => {
              console.log("ADMIN CLICKED");
              onClose();
              navigation.navigate("Admin");
            }}
          >
            <Text>Admin</Text>
          </Pressable>
        )}

        <Pressable style={styles.item}>
          <Text>Settings</Text>
        </Pressable>

        <Pressable style={styles.item}>
          <Text style={{ color: "red" }}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "box-none",
    zIndex: 10000,
    elevation: 10000,
  },
  closeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dropdown: {
    position: "absolute",
    top: 70,
    right: 16,
    width: 170,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    zIndex: 10001,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});