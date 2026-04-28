import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth(); // get global auth state

  if (loading) {
    // wait until auth state is resolved
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    // block access if user is not logged in
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please log in to access this page.</Text>
      </View>
    );
  }

  // if user is authenticated then render protected content
  return <>{children}</>;
}