import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { authService, inspectionService } from "../../services/firebase";
import { CarInspection } from "../../types";

export default function HomeScreen() {
  const [inspections, setInspections] = useState<CarInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

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
      setInspections(userInspections);
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

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
            router.replace("/auth/login");
          } catch (error) {
            Alert.alert("Hata", "Çıkış yapılamadı");
          }
        },
      },
    ]);
  };

  const handleDeleteInspection = async (inspectionId: string) => {
    Alert.alert(
      "İncelemeyi Sil",
      "Bu incelemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await inspectionService.deleteInspection(inspectionId);
              // Listeyi yenile
              if (user) {
                await loadInspections(user.uid);
              }
            } catch (error) {
              Alert.alert("Hata", "İnceleme silinemedi");
            }
          },
        },
      ]
    );
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
        return "#F59E0B";
      case "processing":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "failed":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hoş geldiniz!</Text>
          <Text style={styles.subtitle}>
            Araç hasar tespiti için yeni bir inceleme başlatın
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Yeni İnceleme Başlat"
            onPress={handleNewInspection}
            size="large"
            style={styles.newInspectionButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son İncelemeler</Text>

          {inspections.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                Henüz inceleme yapmadınız. İlk incelemenizi başlatmak için
                yukarıdaki butona tıklayın.
              </Text>
            </Card>
          ) : (
            inspections.slice(0, 5).map((inspection) => (
              <Card key={inspection.id} style={styles.inspectionCard}>
                <View style={styles.inspectionHeader}>
                  <Text style={styles.inspectionTitle}>
                    İnceleme #{inspection.id.slice(-6)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(inspection.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(inspection.status)}
                    </Text>
                  </View>
                </View>

                {inspection.carPlate && (
                  <Text style={styles.carPlate}>
                    Plaka: {inspection.carPlate}
                  </Text>
                )}

                <Text style={styles.inspectionDate}>
                  {new Date(inspection.createdAt).toLocaleDateString("tr-TR")}
                </Text>

                {inspection.status === "completed" && inspection.damages && (
                  <View style={styles.damageSummary}>
                    <Text style={styles.damageText}>
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
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteInspection(inspection.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  welcomeText: {
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
  actions: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  newInspectionButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 24,
  },
  inspectionCard: {
    marginBottom: 12,
  },
  inspectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inspectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  carPlate: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  inspectionDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  damageSummary: {
    marginBottom: 12,
  },
  damageText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  detailButton: {
    alignSelf: "flex-start",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoutButton: {
    borderColor: "#EF4444",
  },
});
