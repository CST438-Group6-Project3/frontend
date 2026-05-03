import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

// global auth context
const AuthContext = createContext<{
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
}>({
  session: null,
  user: null,
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // if no profile exists, create one
        if (error.code === 'PGRST116') {
          if (email) {
            const { data: newProfile, error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: userId,
                  email: email,
                  name: email.split('@')[0],
                  role: 'user',
                },
              ])
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user profile:', insertError);
              return null;
            }

            return newProfile as UserProfile;
          }
          return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('Exception fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // fetch existing session from Supabase on app start
        // Supabase JS automatically reads from localStorage on web and handles
        // token refresh — do not manually read/write localStorage here
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);

        if (session?.user?.id) {
          const profile = await fetchUserProfile(session.user.id, session.user.email);
          if (!mounted) return;
          setUser(profile);
        }
      } catch (err) {
        console.error('initAuth error:', err);
      } finally {
        // always resolve loading no matter what
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!mounted) return;
          setSession(session);

          if (session?.user?.id) {
            const profile = await fetchUserProfile(session.user.id, session.user.email);
            if (mounted) setUser(profile);
          } else {
            setUser(null);
          }

          // only persist session manually on native — Supabase JS handles
          // web localStorage automatically and manual writes cause refresh bugs
          if (Platform.OS !== 'web') {
            if (session) {
              await SecureStore.setItemAsync('session', JSON.stringify(session));
            } else {
              await SecureStore.deleteItemAsync('session');
            }
          }
        } catch (err) {
          console.error('onAuthStateChange error:', err);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};