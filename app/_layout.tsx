import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "../components/AuthProvider";
import { StripeProvider } from "@stripe/stripe-react-native";

import { useColorScheme } from "@/hooks/useColorScheme";

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { loading } = useAuth();

  if (!loaded || loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="credits-simple" />
        <Stack.Screen name="credit-history" />
        <Stack.Screen name="inspection/new" />
        <Stack.Screen name="inspection/camera/[id]" />
        <Stack.Screen name="inspection/camera-simple/[id]" />
        <Stack.Screen name="inspection/result/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <StripeProvider publishableKey="pk_test_51RkVQ2Gf2wvyP4TG6rLY9KJfzWKjwv45BxDOkacpsRhxomYAyLEbkDZdW6kOV3hktw9RhdVePI1B63HtaGNhlaSS002tSrk2HS">
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </StripeProvider>
  );
}
