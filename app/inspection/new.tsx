import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { authService, inspectionService } from "../../services/firebase";

export default function NewInspectionScreen() {
  const [carPlate, setCarPlate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartInspection = async () => {
    if (!carPlate.trim()) {
      Alert.alert("Hata", "Lütfen araç plakasını girin");
      return;
    }

    setLoading(true);
    try {
      const user = authService.onAuthStateChanged((user) => {
        if (user) {
          inspectionService
            .createInspection(user.uid, carPlate.trim())
            .then((inspectionId) => {
              router.push(`/inspection/camera/${inspectionId}` as any);
            })
            .catch((error) => {
              Alert.alert("Hata", "İnceleme oluşturulamadı");
            });
        }
      });
    } catch (error) {
      Alert.alert("Hata", "İnceleme başlatılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Yeni İnceleme</Text>
          <Text style={styles.subtitle}>
            Araç hasar tespiti için gerekli bilgileri girin
          </Text>
        </View>

        <View style={styles.content}>
          <Card>
            <Text style={styles.cardTitle}>Araç Bilgileri</Text>

            <Input
              label="Araç Plakası"
              placeholder="34 ABC 123"
              value={carPlate}
              onChangeText={setCarPlate}
              autoCapitalize="characters"
            />

            <Text style={styles.infoText}>
              Plaka bilgisi isteğe bağlıdır. Boş bırakabilirsiniz.
            </Text>
          </Card>

          <Card variant="gradient">
            <Text style={styles.instructionTitle}>İnceleme Süreci</Text>
            <View style={styles.steps}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Araç resimlerini çekin</Text>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Yapay zeka analizi bekleyin</Text>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Hasar raporunu inceleyin</Text>
              </View>
            </View>
          </Card>

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
    </LinearGradient>
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
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  content: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  steps: {
    gap: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  startButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    borderColor: "#6B7280",
  },
});
