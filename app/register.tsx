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
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { authService } from "../services/firebase";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password, name);
      Alert.alert("Başarılı", "Hesabınız oluşturuldu", [
        { text: "Tamam", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      Alert.alert("Kayıt Hatası", error.message || "Kayıt yapılamadı");
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
              <Text style={styles.title}>Hesap Oluştur</Text>
              <Text style={styles.subtitle}>CarCheck&apos;e hoş geldiniz</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Ad Soyad"
                placeholder="Adınızı ve soyadınızı girin"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

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

              <Input
                label="Şifre Tekrar"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <Button
                title="Hesap Oluştur"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
              />

              <Button
                title="Giriş Yap"
                onPress={() => router.back()}
                variant="outline"
                style={styles.loginButton}
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
    fontSize: 36,
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
  registerButton: {
    marginTop: 16,
  },
  loginButton: {
    marginTop: 12,
  },
});
