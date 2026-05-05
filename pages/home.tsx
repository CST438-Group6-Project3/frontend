import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const navigation = useNavigation();
  const { session, user } = useAuth(); // current auth user and profile

  useEffect(() => {
    // only if on web and when user is logged in
    if (Platform.OS !== 'web' || !session) return;

    // stops browser back button from navigating away
    const blockBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.replaceState(null, '', window.location.href);
    window.history.pushState(null, '', window.location.href);

    // listen for back button
    window.addEventListener('popstate', blockBack);

    // cleanup listener
    return () => {
      window.removeEventListener('popstate', blockBack);
    };
  }, [session]);

  const handleLogout = async () => {
    // sign out user via Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      // show error if logout fails
      Alert.alert('Logout failed', error.message);
      console.error('Logout error:', error.message);
      return;
    }

    // reset navigation so user cannot go back to a protected screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' as never }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>You are logged in.</Text>

      {user && (
        <>
          <Text style={styles.userInfo}>Name: {user.name}</Text>
          <Text style={styles.userInfo}>Email: {user.email}</Text>
          <Text style={styles.userInfo}>Role: {user.role}</Text>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

// ui
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  userInfo: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});