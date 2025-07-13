import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../components/AuthProvider";

export default function IndexPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log(
      "Index useEffect triggered - loading:",
      loading,
      "user:",
      user ? user.email : "null"
    );

    if (!loading) {
      console.log(
        "Auth loading completed, user:",
        user ? `logged in as ${user.email}` : "not logged in"
      );

      if (user) {
        // Giriş yapmışsa ana sayfaya yönlendir
        console.log("Redirecting to main app...");
        router.replace("/(tabs)");
      } else {
        // Giriş yapmamışsa login sayfasına yönlendir
        console.log("Redirecting to login...");
        router.replace("/auth/login");
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>CarCheck Yükleniyor...</Text>
      {loading && (
        <Text style={styles.subText}>
          Kullanıcı bilgileri kontrol ediliyor...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  text: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "500",
  },
  subText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});
