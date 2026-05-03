import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigation = useNavigation();

  useEffect(() => {
    // listen for auth state change rather than calling getSession directly —
    // on web the tokens arrive in the URL hash and Supabase needs a moment
    // to parse them before getSession returns a valid session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // clean up URL hash after OAuth on web
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }

      if (event === 'SIGNED_IN' && session) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Map' as never }],
        });
      } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Authenticating...</Text>
    </View>
  );
}