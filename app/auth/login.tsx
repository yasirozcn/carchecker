import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authService } from "../../services/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Giriş Hatası", error.message || "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>CarCheck</Text>
              <Text style={styles.subtitle}>Araç Hasar Tespiti</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="E-posta"
                placeholder="E-posta adresinizi girin"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Şifre"
                placeholder="Şifrenizi girin"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                title="Giriş Yap"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              <Button
                title="Hesap Oluştur"
                onPress={() => router.push("/register")}
                variant="outline"
                style={styles.registerButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#E5E7EB",
    textAlign: "center",
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loginButton: {
    marginTop: 16,
  },
  registerButton: {
    marginTop: 12,
  },
});
