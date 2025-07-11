import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { inspectionService, storageService } from "../../../services/firebase";

export default function SimpleCameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [uploading, setUploading] = useState(false);

  const simulatePhotoCapture = async () => {
    setUploading(true);
    try {
      // Mock resim URL'leri
      const mockImages = {
        front: "mock://storage/inspections/front.jpg",
        back: "mock://storage/inspections/back.jpg",
        left: "mock://storage/inspections/left.jpg",
        right: "mock://storage/inspections/right.jpg",
        top: "mock://storage/inspections/top.jpg",
      };

      await inspectionService.updateInspectionImages(id, mockImages);
      await inspectionService.updateInspectionStatus(id, "processing");

      // Yapay zeka analizi simülasyonu
      setTimeout(async () => {
        try {
          const damages = await (
            await import("../../../services/aiService")
          ).aiService.analyzeImages([]);
          await inspectionService.updateInspectionStatus(
            id,
            "completed",
            damages
          );
          router.push(`/inspection/result/${id}` as any);
        } catch (error) {
          await inspectionService.updateInspectionStatus(id, "failed");
          Alert.alert("Hata", "Analiz sırasında bir hata oluştu");
        }
      }, 3000);
    } catch (error) {
      Alert.alert("Hata", "İşlem başarısız");
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Modu</Text>
          <Text style={styles.subtitle}>
            Kamera henüz hazır değil, test modunda devam ediyoruz
          </Text>
        </View>

        <View style={styles.content}>
          <Card>
            <Text style={styles.cardTitle}>Test İncelemesi</Text>
            <Text style={styles.cardText}>
              Bu test modunda gerçek fotoğraf çekimi yerine mock veriler
              kullanılıyor. Yapay zeka analizi simüle edilecek.
            </Text>
          </Card>

          <Card variant="gradient">
            <Text style={styles.instructionTitle}>Test Süreci</Text>
            <View style={styles.steps}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Mock fotoğraflar oluşturuluyor
                </Text>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Yapay zeka analizi simüle ediliyor
                </Text>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Hasar raporu oluşturuluyor</Text>
              </View>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Test Analizini Başlat"
              onPress={simulatePhotoCapture}
              loading={uploading}
              size="large"
              style={styles.startButton}
            />

            <Button
              title="Geri Dön"
              onPress={() => router.back()}
              variant="outline"
              style={styles.backButton}
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
  cardText: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
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
  backButton: {
    borderColor: "#6B7280",
  },
});
