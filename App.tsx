import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider } from "./auth/AuthProvider";
import Login from "./pages/login";
import Signup from "./pages/signup";
import AuthCallback from "./pages/auth-callback";
import Home from "./pages/home";
import MapScreen from "./src/screens/MapScreen";
import Profile from "./src/screens/ProfileScreen";
import Admin from "./pages/admin";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  AuthCallback: undefined;
  Home: undefined;
  Map: undefined;
  Profile: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="AuthCallback" component={AuthCallback} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Admin" component={Admin} />
        </Stack.Navigator>

        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}