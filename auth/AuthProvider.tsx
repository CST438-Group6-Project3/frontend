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
  // current user session
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
    const initAuth = async () => {
      // fetch existing session from Supabase on app start
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user?.id) {
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        setUser(profile);
      }

      setLoading(false); // auth state resolved
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session); // update global session

        if (session?.user?.id) {
          const profile = await fetchUserProfile(session.user.id, session.user.email);
          setUser(profile);
        } else {
          setUser(null);
        }

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
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};