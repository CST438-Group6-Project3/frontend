import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import type { LocationResponse } from "../src/api/locations";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/api";

type User = {
  id: string;
  email: string;
  role: "admin" | "user";
  avatarUrl?: string | null;
};

type LocationStatus = "pending" | "verified" | "archived";

export default function Admin() {
  const navigation = useNavigation<any>();

  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [locationFilter, setLocationFilter] =
    useState<LocationStatus>("pending");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(false);

  const adminHeaders = {
    headers: { "X-User-Role": "admin" },
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData(locationFilter);
    }
  }, [isAdmin, locationFilter]);

  async function checkAdmin() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData.user;

      if (!authUser) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (error) throw error;

      setIsAdmin(data?.role === "admin");
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  }

  async function loadData(status: LocationStatus) {
    try {
      setLoading(true);

      const [usersRes, locationsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/users`, adminHeaders),
        axios.get(
          `${API_BASE_URL}/admin/locations/status/${status}`,
          adminHeaders
        ),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  async function promoteUser(user: User) {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/admin/users/${user.id}/promote`,
        {},
        adminHeaders
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: res.data.role } : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteUser(user: User) {
    if (user.role === "admin") return;

    try {
      await axios.delete(
        `${API_BASE_URL}/admin/users/${user.id}`,
        adminHeaders
      );
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
    }
  }

  async function verifyLocation(id: string) {
    await axios.put(
      `${API_BASE_URL}/admin/locations/${id}/verify`,
      {},
      adminHeaders
    );
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }

  async function archiveLocation(id: string) {
    await axios.put(
      `${API_BASE_URL}/admin/locations/${id}/archive`,
      {},
      adminHeaders
    );
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }

  if (checkingAdmin || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text>Access denied</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* BACK BUTTON */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Admin Panel</Text>

      <Text style={styles.section}>Users ({users.length})</Text>

      {users.map((user) => (
        <View key={user.id} style={styles.card}>
          <View style={styles.row}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} style={styles.avatar as any} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user.email[0].toUpperCase()}
                </Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.email}>{user.email}</Text>
              <Text>Role: {user.role}</Text>
            </View>

            {user.role !== "admin" && (
              <View style={styles.buttons}>
                <Pressable
                  style={styles.promote}
                  onPress={() => promoteUser(user)}
                >
                  <Text style={styles.btnText}>Promote</Text>
                </Pressable>

                <Pressable
                  style={styles.delete}
                  onPress={() => deleteUser(user)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      ))}

      <Text style={styles.section}>
        Locations ({locations.length})
      </Text>

      <View style={styles.filters}>
        {(["pending", "verified", "archived"] as LocationStatus[]).map(
          (s) => (
            <Pressable
              key={s}
              style={[
                styles.filter,
                locationFilter === s && styles.activeFilter,
              ]}
              onPress={() => setLocationFilter(s)}
            >
              <Text>{s}</Text>
            </Pressable>
          )
        )}
      </View>

      {locations.map((loc) => (
        <View key={loc.id} style={styles.card}>
          <Text style={styles.email}>{loc.name}</Text>
          <Text>{loc.description}</Text>
          <Text>Status: {loc.status}</Text>

          {loc.status === "pending" && (
            <View style={styles.buttons}>
              <Pressable
                style={styles.promote}
                onPress={() => verifyLocation(loc.id)}
              >
                <Text style={styles.btnText}>Verify</Text>
              </Pressable>

              <Pressable
                style={styles.delete}
                onPress={() => archiveLocation(loc.id)}
              >
                <Text style={styles.btnText}>Archive</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  backButton: { marginBottom: 10 },
  backText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },

  title: { fontSize: 28, fontWeight: "bold" },
  section: { fontSize: 20, marginTop: 20 },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },

  avatar: { width: 40, height: 40, borderRadius: 20 },

  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { color: "#fff", fontWeight: "bold" },

  email: { fontWeight: "bold" },

  buttons: { flexDirection: "row", gap: 8 },

  promote: {
    backgroundColor: "blue",
    padding: 6,
    borderRadius: 6,
  },

  delete: {
    backgroundColor: "red",
    padding: 6,
    borderRadius: 6,
  },

  btnText: { color: "#fff" },

  filters: { flexDirection: "row", gap: 10, marginVertical: 10 },

  filter: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 10,
  },

  activeFilter: {
    backgroundColor: "#ddd",
  },
});