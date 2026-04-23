import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // retrieve current session after OAuth redirect (Google/GitHub)
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        // log any issues during session retrieval
        console.error('Auth callback error:', error);
      }

      // clean up URL after OAuth
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }

      if (data.session) {
        // if login succeeded then redirect to Home and reset navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      } else {
        // if no session then redirect back to Login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        });
      }
    };

    handleAuthCallback(); // run once when component mounts
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Authenticating...</Text>
    </View>
  );
}