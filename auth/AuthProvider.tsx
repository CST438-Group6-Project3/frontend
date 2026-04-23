import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// global auth context
const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
}>({
  session: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // current user session
  const [session, setSession] = useState<Session | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      // fetch existing session from Supabase on app start
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false); // auth state resolved
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session); // update global session

        if (session) {
          // persist session locally depending on platform
          if (Platform.OS === 'web') {
            localStorage.setItem('session', JSON.stringify(session));
          } else {
            await SecureStore.setItemAsync('session', JSON.stringify(session));
          }
        } else {
          if (Platform.OS === 'web') {
            localStorage.removeItem('session');
          } else {
            await SecureStore.deleteItemAsync('session');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};