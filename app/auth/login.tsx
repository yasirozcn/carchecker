import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authService } from "../../services/firebase";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

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

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons
                  name="car-sport"
                  size={height * 0.08}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.title}>CarCheck</Text>
              <Text style={styles.subtitle}>Araç Hasar Tespiti</Text>
              <Text style={styles.description}>
                AI destekli araç hasar tespiti ile güvenli ve hızlı inceleme
              </Text>
            </View>

            {/* Form */}
            <View style={[styles.form, { backgroundColor: colors.surface }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Hesabınıza Giriş Yapın
              </Text>

              <View style={styles.inputContainer}>
                <Input
                  label="E-posta"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Şifre"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              <Button
                title="Giriş Yap"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.cardBorder },
                  ]}
                />
                <Text
                  style={[styles.dividerText, { color: colors.textSecondary }]}
                >
                  veya
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.cardBorder },
                  ]}
                />
              </View>

              <Button
                title="Hesap Oluştur"
                onPress={handleRegister}
                variant="outline"
                style={styles.registerButton}
              />
            </View>

            {/* Features - Compact Version */}
            <View style={styles.features}>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Hızlı Fotoğraf</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.featureText}>Güvenli Analiz</Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.featureText}>Detaylı Rapor</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="cloud-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Bulut Depolama</Text>
                </View>
              </View>
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
    minHeight: height,
  },
  content: {
    padding: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: height * 0.12,
    height: height * 0.12,
    borderRadius: height * 0.06,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: Math.min(height * 0.06, 48),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: Math.min(height * 0.025, 20),
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  description: {
    fontSize: Math.min(height * 0.02, 16),
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  form: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: 50,
    zIndex: 1,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  registerButton: {
    marginBottom: 8,
  },
  features: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  featureItem: {
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
});
