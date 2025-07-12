import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { inspectionService } from "../../../services/firebase";
import { CarInspection, Damage } from "../../../types";
import { Colors } from "../../../constants/Colors";
import { useColorScheme } from "../../../hooks/useColorScheme";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inspection, setInspection] = useState<CarInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (id) {
      loadInspection();
    }
  }, [id]);

  const loadInspection = async () => {
    try {
      const inspectionData = await inspectionService.getInspection(id);
      setInspection(inspectionData);
    } catch {
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

  const getDamageTypeIcon = (type: string): string => {
    switch (type) {
      case "scratch":
        return "create-outline";
      case "dent":
        return "remove-circle-outline";
      case "crack":
        return "git-branch-outline";
      case "chip":
        return "diamond-outline";
      case "other":
        return "help-circle-outline";
      default:
        return "alert-circle-outline";
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
        return colors.accent;
      case "moderate":
        return colors.warning;
      case "severe":
        return colors.error;
      default:
        return colors.textTertiary;
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

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "processing":
        return "sync-outline";
      case "completed":
        return "checkmark-circle-outline";
      case "failed":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="analytics-outline" size={64} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Sonuçlar Yükleniyor...
        </Text>
      </View>
    );
  }

  if (!inspection) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          İnceleme bulunamadı
        </Text>
        <Button
          title="Ana Sayfaya Dön"
          onPress={() => router.replace("/(tabs)")}
          style={styles.errorButton}
        />
      </View>
    );
  }

  // AI analiz sonuçlarını al
  const aiResults = inspection.damages || [];

  // Araç tespit bilgilerini al
  const vehicleInfo =
    aiResults.find((d) => d.vehicleDetected !== undefined) ||
    aiResults[0] ||
    {};
  const vehicleDetected = vehicleInfo?.vehicleDetected !== false;
  const vehicleType = vehicleInfo?.vehicleType || "Araç";
  const vehicleConfidence = vehicleInfo?.vehicleConfidence || 0;

  // Genel durum bilgisini al
  const overallCondition = vehicleInfo?.overallCondition || "unknown";

  // Gerçek hasarları filtrele (araç tespit bilgilerini hariç tut)
  const actualDamages = aiResults.filter(
    (d) => d.type && d.location && !d.vehicleDetected && !d.vehicleType
  );

  const severeDamages =
    actualDamages.filter((d) => d.severity === "severe").length || 0;
  const moderateDamages =
    actualDamages.filter((d) => d.severity === "moderate").length || 0;
  const minorDamages =
    actualDamages.filter((d) => d.severity === "minor").length || 0;

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
              <Ionicons name="document-text" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>İnceleme Sonucu</Text>
            <Text style={styles.subtitle}>
              İnceleme #{inspection.id.slice(-6)}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Inspection Info Card */}
          <Card style={{ ...styles.infoCard, backgroundColor: colors.card }}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                İnceleme Bilgileri
              </Text>
            </View>

            <View style={styles.infoGrid}>
              {inspection.carPlate && (
                <View style={styles.infoItem}>
                  <Ionicons
                    name="car-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Plaka
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {inspection.carPlate}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.infoItem}>
                <Ionicons
                  name={getStatusIcon(inspection.status) as any}
                  size={20}
                  color={getSeverityColor(inspection.status)}
                />
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Durum
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {getStatusText(inspection.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Tarih
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {new Date(inspection.createdAt).toLocaleDateString(
                      "tr-TR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Vehicle Detection Card */}
          <Card style={{ ...styles.infoCard, backgroundColor: colors.card }}>
            <View style={styles.cardHeader}>
              <Ionicons
                name={vehicleDetected ? "car" : "car-outline"}
                size={24}
                color={vehicleDetected ? colors.success : colors.error}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Araç Tespiti
              </Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons
                  name={vehicleDetected ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={vehicleDetected ? colors.success : colors.error}
                />
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Durum
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {vehicleDetected ? "Tespit Edildi" : "Tespit Edilemedi"}
                  </Text>
                </View>
              </View>

              {vehicleDetected && (
                <>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="car-sport"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Araç Türü
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {vehicleType}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons
                      name="analytics"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Güven Oranı
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        %{Math.round(vehicleConfidence * 100)}
                      </Text>
                      <View style={styles.confidenceBar}>
                        <View
                          style={[
                            styles.confidenceFill,
                            {
                              width: `${vehicleConfidence * 100}%`,
                              backgroundColor:
                                vehicleConfidence > 0.8
                                  ? colors.success
                                  : vehicleConfidence > 0.6
                                  ? colors.warning
                                  : colors.error,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons
                      name="shield-checkmark"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Genel Durum
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {overallCondition === "excellent" && "Mükemmel"}
                        {overallCondition === "good" && "İyi"}
                        {overallCondition === "fair" && "Orta"}
                        {overallCondition === "poor" && "Kötü"}
                        {overallCondition === "unknown" && "Bilinmiyor"}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </Card>

          {/* AI Analiz Detayları */}
          {inspection.status === "completed" && aiResults.length > 0 && (
            <Card style={{ ...styles.infoCard, backgroundColor: colors.card }}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="analytics-outline"
                  size={24}
                  color={colors.accent}
                />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  AI Analiz Detayları
                </Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons
                    name="eye-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Analiz Edilen Resim
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {aiResults.length} pozisyon
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Başarılı Analiz
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {
                        aiResults.filter(
                          (r) => r.vehicleDetected !== undefined || r.type
                        ).length
                      }{" "}
                      / {aiResults.length}
                    </Text>
                  </View>
                </View>

                {vehicleDetected && (
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="car-sport-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Tespit Edilen Araç
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {vehicleType} (%{Math.round(vehicleConfidence * 100)})
                      </Text>
                    </View>
                  </View>
                )}

                {actualDamages.length > 0 && (
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="warning-outline"
                      size={20}
                      color={colors.warning}
                    />
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Tespit Edilen Hasar
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {actualDamages.length} adet
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card>
          )}

          {inspection.status === "completed" &&
          actualDamages &&
          actualDamages.length > 0 ? (
            <>
              {/* Summary Stats Card */}
              <Card
                style={{ ...styles.summaryCard, backgroundColor: colors.card }}
              >
                <View style={styles.cardHeader}>
                  <Ionicons
                    name="stats-chart-outline"
                    size={24}
                    color={colors.accent}
                  />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Hasar Özeti
                  </Text>
                </View>

                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statCircle,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.statNumber, { color: colors.primary }]}
                      >
                        {actualDamages.length}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Toplam
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statCircle,
                        { backgroundColor: colors.error + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.statNumber, { color: colors.error }]}
                      >
                        {severeDamages}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Ciddi
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statCircle,
                        { backgroundColor: colors.warning + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.statNumber, { color: colors.warning }]}
                      >
                        {moderateDamages}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Orta
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statCircle,
                        { backgroundColor: colors.accent + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.statNumber, { color: colors.accent }]}
                      >
                        {minorDamages}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Hafif
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Damages Section */}
              <View style={styles.damagesSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="warning-outline"
                    size={24}
                    color={colors.warning}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Tespit Edilen Hasar Detayları
                  </Text>
                </View>

                {actualDamages.map((damage: Damage, index: number) => (
                  <Card
                    key={damage.id || index}
                    style={{
                      ...styles.damageCard,
                      backgroundColor: colors.card,
                    }}
                  >
                    <View style={styles.damageHeader}>
                      <View style={styles.damageTypeContainer}>
                        <Ionicons
                          name={getDamageTypeIcon(damage.type) as any}
                          size={20}
                          color={colors.primary}
                        />
                        <View
                          style={[
                            styles.damageType,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.damageTypeText,
                              { color: colors.primary },
                            ]}
                          >
                            {getDamageTypeText(damage.type)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.severityBadge,
                          {
                            backgroundColor:
                              getSeverityColor(damage.severity) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.severityText,
                            { color: getSeverityColor(damage.severity) },
                          ]}
                        >
                          {getSeverityText(damage.severity)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.damageContent}>
                      <View style={styles.locationContainer}>
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.damageLocation,
                            { color: colors.text },
                          ]}
                        >
                          {damage.location}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.damageDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {damage.description}
                      </Text>

                      <View style={styles.confidenceContainer}>
                        <View style={styles.confidenceHeader}>
                          <Ionicons
                            name="trending-up-outline"
                            size={16}
                            color={colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.confidenceText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Güven: %{Math.round(damage.confidence * 100)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.confidenceTrack,
                            { backgroundColor: colors.cardBorder },
                          ]}
                        >
                          <View
                            style={[
                              styles.confidenceFill,
                              {
                                width: `${damage.confidence * 100}%`,
                                backgroundColor: colors.primary,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </>
          ) : inspection.status === "completed" ? (
            <Card
              style={{ ...styles.successCard, backgroundColor: colors.card }}
            >
              <View style={styles.successContent}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={64}
                  color={colors.accent}
                />
                <Text style={[styles.successTitle, { color: colors.text }]}>
                  Tebrikler!
                </Text>
                <Text
                  style={[styles.successText, { color: colors.textSecondary }]}
                >
                  Araçta herhangi bir hasar tespit edilmedi.
                </Text>
              </View>
            </Card>
          ) : inspection.status === "processing" ? (
            <Card
              style={{ ...styles.processingCard, backgroundColor: colors.card }}
            >
              <View style={styles.processingContent}>
                <Ionicons
                  name="sync-outline"
                  size={64}
                  color={colors.warning}
                />
                <Text style={[styles.processingTitle, { color: colors.text }]}>
                  Analiz Devam Ediyor
                </Text>
                <Text
                  style={[
                    styles.processingText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Lütfen bekleyin...
                </Text>
              </View>
            </Card>
          ) : inspection.status === "failed" ? (
            <Card style={{ ...styles.errorCard, backgroundColor: colors.card }}>
              <View style={styles.errorContent}>
                <Ionicons
                  name="close-circle-outline"
                  size={64}
                  color={colors.error}
                />
                <Text style={[styles.errorTitle, { color: colors.text }]}>
                  Analiz Hatası
                </Text>
                <Text
                  style={[
                    styles.errorDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.
                </Text>
              </View>
            </Card>
          ) : null}

          {/* Actions */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  errorButton: {
    marginTop: 24,
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
  },
  content: {
    padding: 24,
    gap: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
  },
  summaryCard: {
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
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  damagesSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  damageCard: {
    borderRadius: 16,
    padding: 20,
  },
  damageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  damageTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  damageType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  damageTypeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  damageContent: {
    gap: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  damageLocation: {
    fontSize: 16,
    fontWeight: "500",
  },
  damageDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  confidenceContainer: {
    gap: 8,
  },
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "500",
  },
  confidenceTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  successCard: {
    borderRadius: 16,
    padding: 32,
  },
  successContent: {
    alignItems: "center",
    gap: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  processingCard: {
    borderRadius: 16,
    padding: 32,
  },
  processingContent: {
    alignItems: "center",
    gap: 16,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  processingText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  errorCard: {
    borderRadius: 16,
    padding: 32,
  },
  errorContent: {
    alignItems: "center",
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  errorDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  newInspectionButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  homeButton: {
    marginBottom: 40,
  },
});
