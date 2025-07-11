import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { authService } from "../services/firebase";

export default function IndexPage() {
  useEffect(() => {
    // Kullanıcının giriş durumunu kontrol et
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        // Giriş yapmışsa ana sayfaya yönlendir
        router.replace("/(tabs)");
      } else {
        // Giriş yapmamışsa login sayfasına yönlendir
        router.replace("/auth/login");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>CarCheck Yükleniyor...</Text>
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
  },
});
