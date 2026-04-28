import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider';

export default function Signup() {
  const navigation = useNavigation();
  const { session, loading } = useAuth(); // global auth state (checks if user already logged in) aka persistent user session

  // form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI error or feeback text
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false); // prevents double submissions

  useEffect(() => {
    // if user is already authenticated, redirect them away from signup
    if (!loading && session) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    }
  }, [loading, session, navigation]);

  if (loading) {
    // block UI until auth state is known which prevents flickering or wrong screen
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  async function handleSubmit() {
    try {
      setError(null);
      setMessage(null);

      // basic validation
      if (!email.trim()) return setError('Email is required.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');

      setSignUpLoading(true);

      // attempt signup with Supabase auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setSignUpLoading(false);

      if (error) {
        setError(error.message);
        return;
      }
      
      setMessage('Check your email to confirm your account. After confirming, you\'ll be signed in automatically.');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setSignUpLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Sign up to get started exploring hidden gems.</Text>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading} // disables input while auth state is loading
          placeholderTextColor="#888"
        />

        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // hides password input
          editable={!loading}
          placeholderTextColor="#888"
        />

        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
          placeholderTextColor="#888"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        {message && (
          <View style={styles.message}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={signUpLoading} // prevents multiple requests while in progress
        >
          <Text style={styles.buttonText}>
            {signUpLoading ? 'Signing up...' : 'Sign up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.link}>Already have an account? Log in</Text>
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
  message: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1b5e20',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  messageText: {
    color: '#81c784',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
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
  buttonText: {
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