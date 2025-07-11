import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { inspectionService, reportService } from "../../../services/firebase";
import { CarInspection, Damage } from "../../../types";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inspection, setInspection] = useState<CarInspection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspection();
  }, [id]);

  const loadInspection = async () => {
    try {
      const inspectionData = await inspectionService.getInspection(id);
      setInspection(inspectionData);
    } catch (error) {
      Alert.alert("Hata", "İnceleme bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const getDamageTypeText = (type: string): string => {
    switch (type) {
      case "scratch":
        return "Çizik";
      case "dent":
        return "Göçük";
      case "crack":
        return "Çatlak";
      case "chip":
        return "Çip";
      case "other":
        return "Diğer";
      default:
        return type;
    }
  };

  const getSeverityText = (severity: string): string => {
    switch (severity) {
      case "minor":
        return "Hafif";
      case "moderate":
        return "Orta";
      case "severe":
        return "Ciddi";
      default:
        return severity;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "minor":
        return "#10B981";
      case "moderate":
        return "#F59E0B";
      case "severe":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "processing":
        return "İşleniyor";
      case "completed":
        return "Tamamlandı";
      case "failed":
        return "Başarısız";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>İnceleme bulunamadı</Text>
        <Button
          title="Ana Sayfaya Dön"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>İnceleme Sonucu</Text>
          <Text style={styles.subtitle}>
            İnceleme #{inspection.id.slice(-6)}
          </Text>
        </View>

        <View style={styles.content}>
          <Card>
            <View style={styles.inspectionInfo}>
              <Text style={styles.infoTitle}>İnceleme Bilgileri</Text>

              {inspection.carPlate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Plaka:</Text>
                  <Text style={styles.infoValue}>{inspection.carPlate}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Durum:</Text>
                <Text style={styles.infoValue}>
                  {getStatusText(inspection.status)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tarih:</Text>
                <Text style={styles.infoValue}>
                  {new Date(inspection.createdAt).toLocaleDateString("tr-TR")}
                </Text>
              </View>
            </View>
          </Card>

          {inspection.status === "completed" &&
          inspection.damages &&
          inspection.damages.length > 0 ? (
            <>
              <Card variant="gradient">
                <Text style={styles.summaryTitle}>Hasar Özeti</Text>
                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {inspection.damages.length}
                    </Text>
                    <Text style={styles.statLabel}>Toplam Hasar</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {
                        inspection.damages.filter(
                          (d) => d.severity === "severe"
                        ).length
                      }
                    </Text>
                    <Text style={styles.statLabel}>Ciddi</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {
                        inspection.damages.filter(
                          (d) => d.severity === "moderate"
                        ).length
                      }
                    </Text>
                    <Text style={styles.statLabel}>Orta</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {
                        inspection.damages.filter((d) => d.severity === "minor")
                          .length
                      }
                    </Text>
                    <Text style={styles.statLabel}>Hafif</Text>
                  </View>
                </View>
              </Card>

              <View style={styles.damagesSection}>
                <Text style={styles.sectionTitle}>
                  Tespit Edilen Hasar Detayları
                </Text>

                {inspection.damages.map((damage: Damage, index: number) => (
                  <Card key={damage.id || index} style={styles.damageCard}>
                    <View style={styles.damageHeader}>
                      <View style={styles.damageType}>
                        <Text style={styles.damageTypeText}>
                          {getDamageTypeText(damage.type)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.severityBadge,
                          {
                            backgroundColor: getSeverityColor(damage.severity),
                          },
                        ]}
                      >
                        <Text style={styles.severityText}>
                          {getSeverityText(damage.severity)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.damageLocation}>
                      Konum: {damage.location}
                    </Text>

                    <Text style={styles.damageDescription}>
                      {damage.description}
                    </Text>

                    <View style={styles.confidenceBar}>
                      <View style={styles.confidenceLabel}>
                        <Text style={styles.confidenceText}>
                          Güven: %{Math.round(damage.confidence * 100)}
                        </Text>
                      </View>
                      <View style={styles.confidenceTrack}>
                        <View
                          style={[
                            styles.confidenceFill,
                            { width: `${damage.confidence * 100}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </>
          ) : inspection.status === "completed" ? (
            <Card>
              <Text style={styles.noDamageText}>
                Tebrikler! Araçta herhangi bir hasar tespit edilmedi.
              </Text>
            </Card>
          ) : inspection.status === "processing" ? (
            <Card>
              <Text style={styles.processingText}>
                Analiz devam ediyor... Lütfen bekleyin.
              </Text>
            </Card>
          ) : inspection.status === "failed" ? (
            <Card>
              <Text style={styles.errorText}>
                Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.
              </Text>
            </Card>
          ) : null}

          <View style={styles.actions}>
            <Button
              title="Yeni İnceleme"
              onPress={() => router.push("/inspection/new")}
              style={styles.newInspectionButton}
            />

            <Button
              title="Ana Sayfaya Dön"
              onPress={() => router.replace("/(tabs)")}
              variant="outline"
              style={styles.homeButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    marginBottom: 24,
    textAlign: "center",
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
  inspectionInfo: {
    gap: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  damagesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  damageCard: {
    marginBottom: 12,
  },
  damageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  damageType: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  damageTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  damageLocation: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  damageDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  confidenceBar: {
    gap: 4,
  },
  confidenceLabel: {
    alignItems: "flex-end",
  },
  confidenceText: {
    fontSize: 12,
    color: "#6B7280",
  },
  confidenceTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  noDamageText: {
    fontSize: 18,
    color: "#10B981",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 24,
  },
  processingText: {
    fontSize: 16,
    color: "#F59E0B",
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  newInspectionButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  homeButton: {
    borderColor: "#6B7280",
  },
});
