import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import type { LocationResponse } from "../src/api/locations";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

type User = {
  id: string;
  email: string;
  role: "admin" | "user";
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(false);

  const adminHeaders = {
    headers: {
      "X-User-Role": isAdmin ? "admin" : "user",
    },
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  async function checkAdmin() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData.user;

      if (!authUser) {
        setIsAdmin(false);
        return;
      }

      const { data: dbUser, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (error) throw error;

      setIsAdmin(dbUser?.role === "admin");
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  }

  async function loadData() {
    try {
      setLoading(true);

      const [usersRes, locationsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/users`, adminHeaders),
        axios.get(`${API_BASE_URL}/admin/locations/pending`, adminHeaders),
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

  async function deleteUser(user: User) {
    if (user.role === "admin") {
      Alert.alert("Not allowed", "Cannot delete another admin.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${user.id}`, adminHeaders);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete user.");
    }
  }

  async function verifyLocation(id: string) {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/locations/${id}/verify`,
        {},
        adminHeaders
      );

      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to verify location.");
    }
  }

  async function archiveLocation(id: string) {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/locations/${id}/archive`,
        {},
        adminHeaders
      );

      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to archive location.");
    }
  }

  if (checkingAdmin) {
    return (
      <View style={styles.center}>
        <Text>Checking admin access...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text>You are not allowed to access this page.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      <Text style={styles.section}>Users</Text>

      {users.map((user) => (
        <View key={user.id} style={styles.card}>
          <Text style={styles.bold}>{user.email}</Text>
          <Text>Role: {user.role}</Text>

          {user.role !== "admin" && (
            <Button
              title="Delete User"
              color="red"
              onPress={() => deleteUser(user)}
            />
          )}
        </View>
      ))}

      <Text style={styles.section}>Pending Locations</Text>

      {locations.length === 0 && <Text>No pending locations.</Text>}

      {locations.map((loc) => (
        <View key={loc.id} style={styles.card}>
          <Text style={styles.bold}>{loc.name}</Text>
          <Text>{loc.description}</Text>
          <Text>Category: {loc.category}</Text>
          <Text>Status: {loc.status}</Text>

          <View style={styles.row}>
            <Button title="Verify" onPress={() => verifyLocation(loc.id)} />
            <Button
              title="Archive"
              color="red"
              onPress={() => archiveLocation(loc.id)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  bold: {
    fontWeight: "bold",
    fontSize: 16,
  },
});