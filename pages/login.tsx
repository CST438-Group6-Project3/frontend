import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider';
import * as WebBrowser from 'expo-web-browser';

// required for native OAuth — completes the auth session after redirect back
WebBrowser.maybeCompleteAuthSession();

const APP_SCHEME = 'hiddengems';

export default function Login() {
  const navigation = useNavigation();
  const { session, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if already logged in skip login screen
    if (!loading && session) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Map' as never }],
      });
    }
  }, [loading, session, navigation]);

  async function handleSubmit() {
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Map' as never }],
    });
  }

  async function signInWithGoogle() {
    setError(null);

    if (Platform.OS === 'web') {
      // web: redirect the whole page to Google OAuth
      const redirectTo = `${window.location.origin}/auth-callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { setError(error.message); return; }
      if (data?.url) window.location.replace(data.url);
    } else {
      // native: open an in-app browser and exchange the code for a session
      const redirectTo = `${APP_SCHEME}://auth-callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { setError(error.message); return; }
      if (data?.url) {
        try {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          // hand the redirect URL back to Supabase so it can extract the session tokens
          if (result.type === 'success' && result.url) {
            const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
            if (sessionError) setError(sessionError.message);
            // onAuthStateChange in AuthProvider will pick up the session and navigate
          }
        } catch (err) {
          console.error('Google OAuth error:', err);
          setError('Authentication failed, please try again.');
        }
      }
    }
  }

  async function signInWithGitHub() {
    setError(null);

    if (Platform.OS === 'web') {
      // web: redirect the whole page to GitHub OAuth
      const redirectTo = `${window.location.origin}/auth-callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { setError(error.message); return; }
      if (data?.url) window.location.replace(data.url);
    } else {
      // native: open an in-app browser and exchange the code for a session
      const redirectTo = `${APP_SCHEME}://auth-callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) { setError(error.message); return; }
      if (data?.url) {
        try {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          // hand the redirect URL back to Supabase so it can extract the session tokens
          if (result.type === 'success' && result.url) {
            const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
            if (sessionError) setError(sessionError.message);
            // onAuthStateChange in AuthProvider will pick up the session and navigate
          }
        } catch (err) {
          console.error('GitHub OAuth error:', err);
          setError('Authentication failed, please try again.');
        }
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue exploring hidden gems.</Text>

        <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.githubButton} onPress={signInWithGitHub}>
          <Text style={styles.githubButtonText}>Continue with GitHub</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.or}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />

        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
          <Text style={styles.link}>New here? Create an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f0f0f',
  },
  loadingCard: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
    color: '#ccc',
  },
  googleButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  githubButton: {
    backgroundColor: '#24292e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  githubButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#444',
  },
  or: {
    paddingHorizontal: 16,
    color: '#888',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#4facfe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4facfe',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#4facfe',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});