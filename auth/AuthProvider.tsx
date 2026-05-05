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
        if (error.code === 'PGRST116') {
          if (!email) return null;

          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: userId,
                email,
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
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);

        if (session?.user?.id) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email
          );

          if (!mounted) return;
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('initAuth error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        setSession(session);

        if (session?.user?.id) {
          fetchUserProfile(session.user.id, session.user.email)
            .then((profile) => {
              if (mounted) setUser(profile);
            })
            .catch((err) => {
              console.error('profile fetch error:', err);
              if (mounted) setUser(null);
            });
        } else {
          setUser(null);
        }

        // Only persist manually on native
        if (Platform.OS !== 'web') {
          if (session) {
            SecureStore.setItemAsync('session', JSON.stringify(session));
          } else {
            SecureStore.deleteItemAsync('session');
          }
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