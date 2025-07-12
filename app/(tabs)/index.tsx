import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  authService,
  inspectionService,
  reportService,
} from "../../services/firebase";
import { CarInspection } from "../../types";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [inspections, setInspections] = useState<CarInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadInspections(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  const loadInspections = async (userId: string) => {
    try {
      const userInspections = await inspectionService.getUserInspections(
        userId
      );

      // Her inceleme için rapor bilgisini de al
      const inspectionsWithReports = await Promise.all(
        userInspections.map(async (inspection) => {
          try {
            const report = await reportService.getReport(inspection.id);
            return {
              ...inspection,
              hasReport: !!report,
            };
          } catch (error) {
            return {
              ...inspection,
              hasReport: false,
            };
          }
        })
      );

      setInspections(inspectionsWithReports);
    } catch (error) {
      console.error("Inspections yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadInspections(user.uid);
    }
    setRefreshing(false);
  };

  const handleNewInspection = () => {
    router.push("/inspection/new");
  };

  const getStatusText = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "processing":
        return colors.primary;
      case "completed":
        return colors.accent;
      case "failed":
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusIcon = (status: string) => {
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
        <Ionicons name="car-sport-outline" size={64} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          CarCheck Yükleniyor...
        </Text>
      </View>
    );
  }

  const completedInspections = inspections.filter(
    (i) => i.status === "completed"
  ).length;
  const totalInspections = inspections.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                Merhaba,{" "}
                {user?.displayName || user?.email?.split("@")[0] || "Kullanıcı"}
                !
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Araç hasar tespiti için hazır mısınız?
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalInspections}</Text>
                <Text style={styles.statLabel}>Toplam İnceleme</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{completedInspections}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Yeni İnceleme Başlat"
            onPress={handleNewInspection}
            size="large"
            style={styles.newInspectionButton}
          />
        </View>

        {/* Recent Inspections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Son İncelemeler
            </Text>
            {inspections.length > 0 && (
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  Tümünü Gör
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {inspections.length === 0 ? (
            <Card style={{ ...styles.emptyCard, backgroundColor: colors.card }}>
              <Ionicons
                name="car-outline"
                size={48}
                color={colors.textTertiary}
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Henüz İnceleme Yok
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                İlk araç incelemenizi başlatmak için yukarıdaki butona tıklayın.
              </Text>
            </Card>
          ) : (
            inspections.slice(0, 3).map((inspection) => (
              <Card
                key={inspection.id}
                style={{
                  ...styles.inspectionCard,
                  backgroundColor: colors.card,
                }}
              >
                <View style={styles.inspectionHeader}>
                  <View style={styles.inspectionInfo}>
                    <Text
                      style={[styles.inspectionTitle, { color: colors.text }]}
                    >
                      İnceleme #{inspection.id.slice(-6)}
                    </Text>
                    {inspection.carPlate && (
                      <Text
                        style={[
                          styles.carPlate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {inspection.carPlate}
                      </Text>
                    )}
                  </View>
                  <View style={styles.statusContainer}>
                    <Ionicons
                      name={getStatusIcon(inspection.status) as any}
                      size={20}
                      color={getStatusColor(inspection.status)}
                    />
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(inspection.status) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(inspection.status) },
                        ]}
                      >
                        {getStatusText(inspection.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={[
                    styles.inspectionDate,
                    { color: colors.textTertiary },
                  ]}
                >
                  {new Date(inspection.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>

                {inspection.status === "completed" && inspection.damages && (
                  <View style={styles.damageSummary}>
                    <Ionicons
                      name="warning-outline"
                      size={16}
                      color={colors.warning}
                    />
                    <Text
                      style={[
                        styles.damageText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {inspection.damages.length} hasar tespit edildi
                    </Text>
                  </View>
                )}

                <View style={styles.cardActions}>
                  <Button
                    title="Detayları Görüntüle"
                    onPress={() =>
                      router.push(`/inspection/result/${inspection.id}` as any)
                    }
                    variant="outline"
                    size="small"
                    style={styles.detailButton}
                  />
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Özellikler
          </Text>
          <View style={styles.featuresGrid}>
            <Card
              style={{ ...styles.featureCard, backgroundColor: colors.card }}
            >
              <Ionicons
                name="camera-outline"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Hızlı Tespit
              </Text>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                AI destekli hasar tespiti
              </Text>
            </Card>
            <Card
              style={{ ...styles.featureCard, backgroundColor: colors.card }}
            >
              <Ionicons
                name="document-text-outline"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Detaylı Rapor
              </Text>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                Kapsamlı hasar raporu
              </Text>
            </Card>
            <Card
              style={{ ...styles.featureCard, backgroundColor: colors.card }}
            >
              <Ionicons
                name="cloud-outline"
                size={32}
                color={colors.secondary}
              />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Bulut Depolama
              </Text>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                Güvenli veri saklama
              </Text>
            </Card>
            <Card
              style={{ ...styles.featureCard, backgroundColor: colors.card }}
            >
              <Ionicons name="share-outline" size={32} color={colors.warning} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Kolay Paylaşım
              </Text>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                Raporları paylaşın
              </Text>
            </Card>
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
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 24,
  },
  welcomeSection: {
    gap: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  quickActions: {
    paddingHorizontal: 24,
    marginTop: -16,
    marginBottom: 24,
  },
  newInspectionButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  testButton: {
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  inspectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  inspectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  inspectionInfo: {
    flex: 1,
  },
  inspectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  carPlate: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inspectionDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  damageSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  damageText: {
    fontSize: 14,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  detailButton: {
    minWidth: 120,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  featureText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
