import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { inspectionService } from "../../services/firebase";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuth } from "../../components/AuthProvider";

export default function NewInspectionScreen() {
  const { user } = useAuth();
  const [carPlate, setCarPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleStartInspection = async () => {
    if (!carPlate.trim()) {
      Alert.alert("Hata", "Lütfen araç plakasını girin");
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        Alert.alert(
          "Hata",
          "Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın."
        );
        return;
      }

      inspectionService
        .createInspection(user.uid, carPlate.trim())
        .then((inspectionId) => {
          router.push(`/inspection/camera/${inspectionId}` as any);
        })
        .catch(() => {
          Alert.alert("Hata", "İnceleme oluşturulamadı");
        });
    } catch {
      Alert.alert("Hata", "İnceleme başlatılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="camera" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Yeni İnceleme</Text>
            <Text style={styles.subtitle}>
              Araç hasar tespiti için gerekli bilgileri girin
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Vehicle Info Card */}
          <Card style={{ ...styles.infoCard, backgroundColor: colors.card }}>
            <View style={styles.cardHeader}>
              <Ionicons name="car-outline" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Araç Bilgileri
              </Text>
            </View>

            <Input
              label="Araç Plakası"
              placeholder="34 ABC 123"
              value={carPlate}
              onChangeText={setCarPlate}
              autoCapitalize="characters"
            />

            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Plaka bilgisi isteğe bağlıdır. Boş bırakabilirsiniz.
              </Text>
            </View>
          </Card>

          {/* Process Steps Card */}
          <Card style={{ ...styles.processCard, backgroundColor: colors.card }}>
            <View style={styles.cardHeader}>
              <Ionicons name="list-outline" size={24} color={colors.accent} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                İnceleme Süreci
              </Text>
            </View>

            <View style={styles.steps}>
              <View style={styles.step}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    Fotoğraf Çekimi
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Araç resimlerini çekin
                  </Text>
                </View>
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.step}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    AI Analizi
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Yapay zeka analizi bekleyin
                  </Text>
                </View>
                <Ionicons
                  name="analytics-outline"
                  size={20}
                  color={colors.secondary}
                />
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.step}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    Rapor İnceleme
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Hasar raporunu inceleyin
                  </Text>
                </View>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={colors.accent}
                />
              </View>
            </View>
          </Card>

          {/* Features Card */}
          <Card
            style={{ ...styles.featuresCard, backgroundColor: colors.card }}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="star-outline" size={24} color={colors.warning} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Özellikler
              </Text>
            </View>

            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons
                  name="flash-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Hızlı analiz
                </Text>
              </View>
              <View style={styles.feature}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.accent}
                />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Güvenli işlem
                </Text>
              </View>
              <View style={styles.feature}>
                <Ionicons
                  name="cloud-outline"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Bulut depolama
                </Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="İncelemeyi Başlat"
              onPress={handleStartInspection}
              loading={loading}
              size="large"
              style={styles.startButton}
            />

            <Button
              title="İptal"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    gap: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
  },
  processCard: {
    borderRadius: 16,
    padding: 20,
  },
  featuresCard: {
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    fontStyle: "italic",
    flex: 1,
    lineHeight: 20,
  },
  steps: {
    gap: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
  },
  stepDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 18,
    marginVertical: 8,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  feature: {
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  startButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelButton: {
    marginBottom: 40,
  },
});
