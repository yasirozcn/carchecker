import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { inspectionService, storageService } from "../../../services/firebase";
import { aiService } from "../../../services/aiService";
import { Colors } from "../../../constants/Colors";
import { useColorScheme } from "../../../hooks/useColorScheme";

const PHOTO_ANGLES = [
  {
    key: "front",
    label: "Ön",
    icon: "car",
    color: "#FF6B6B",
    description: "Ön tampon ve far",
  },
  {
    key: "back",
    label: "Arka",
    icon: "car-sport",
    color: "#4ECDC4",
    description: "Arka tampon ve stop",
  },
  {
    key: "left",
    label: "Sol",
    icon: "car-outline",
    color: "#45B7D1",
    description: "Sol yan panel",
  },
  {
    key: "right",
    label: "Sağ",
    icon: "car-sport-outline",
    color: "#96CEB4",
    description: "Sağ yan panel",
  },
  {
    key: "top",
    label: "Üst",
    icon: "car-sport-sharp",
    color: "#FFEAA7",
    description: "Tavan ve cam",
  },
];

export default function CameraScreen() {
  const { id } = useLocalSearchParams();
  const [currentAngle, setCurrentAngle] = useState(0);
  const [photos, setPhotos] = useState<{ [key: string]: string }>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const testAPI = async () => {
    try {
      const isWorking = await aiService.testAPIKey();
      if (isWorking) {
        Alert.alert("Başarılı", "API bağlantısı çalışıyor!");
      } else {
        Alert.alert(
          "Hata",
          "API bağlantısı başarısız. API key'i kontrol edin."
        );
      }
    } catch {
      Alert.alert("Hata", "API test edilirken hata oluştu.");
    }
  };

  const testStorage = async () => {
    try {
      const isWorking = await storageService.testStorageConnection();
      if (isWorking) {
        Alert.alert("Başarılı", "Firebase Storage bağlantısı çalışıyor!");
      } else {
        Alert.alert(
          "Hata",
          "Firebase Storage bağlantısı başarısız. Storage kurallarını kontrol edin."
        );
      }
    } catch {
      Alert.alert("Hata", "Storage test edilirken hata oluştu.");
    }
  };

  const takePicture = async () => {
    try {
      const angleKey = PHOTO_ANGLES[currentAngle].key;
      console.log("=== FOTOĞRAF ÇEKME BAŞLADI ===");
      console.log("Açı:", angleKey, "Mevcut açı:", currentAngle);

      // Gerçek kamera ile fotoğraf çek
      console.log("Kamera açılıyor...");
      const photoBase64 = await aiService.takePhoto();
      console.log("Kamera kapandı, fotoğraf alındı mı:", !!photoBase64);

      if (photoBase64) {
        console.log("Fotoğraf başarıyla çekildi, state güncelleniyor...");

        // State güncellemesini daha güvenli yap
        // Memory kullanımını azaltmak için fotoğrafı optimize et
        console.log("Fotoğraf optimize ediliyor...");
        const optimizedPhoto = await aiService.optimizeImage(photoBase64);
        console.log("Fotoğraf optimize edildi");

        setPhotos((prev) => {
          console.log("Önceki fotoğraflar:", Object.keys(prev));
          const newPhotos = { ...prev, [angleKey]: optimizedPhoto };
          console.log("Yeni fotoğraflar:", Object.keys(newPhotos));
          console.log("=== FOTOĞRAF ÇEKME TAMAMLANDI ===");
          return newPhotos;
        });

        // Otomatik geçişi kaldır, manuel kontrol et
        console.log("Otomatik geçiş devre dışı bırakıldı");

        // Sadece kullanıcıya bilgi ver
        Alert.alert(
          "Başarılı",
          `${angleKey} açısından fotoğraf çekildi. Diğer açılardan da fotoğraf çekebilirsiniz.`
        );
      }
    } catch (error) {
      console.error("=== FOTOĞRAF ÇEKME HATASI ===", error);
      Alert.alert(
        "Hata",
        "Fotoğraf çekilirken bir hata oluştu: " + (error as Error).message
      );
    }
  };

  const pickImage = async () => {
    try {
      const angleKey = PHOTO_ANGLES[currentAngle].key;
      console.log("=== GALERİ SEÇİMİ BAŞLADI ===");
      console.log("Açı:", angleKey);

      // Galeriden fotoğraf seç
      console.log("Galeri açılıyor...");
      const photoBase64 = await aiService.pickImage();
      console.log("Galeri kapandı, fotoğraf seçildi mi:", !!photoBase64);

      if (photoBase64) {
        console.log("Fotoğraf başarıyla seçildi, state güncelleniyor...");

        // Memory kullanımını azaltmak için fotoğrafı optimize et
        console.log("Fotoğraf optimize ediliyor...");
        const optimizedPhoto = await aiService.optimizeImage(photoBase64);
        console.log("Fotoğraf optimize edildi");

        setPhotos((prev) => {
          console.log("Önceki fotoğraflar:", Object.keys(prev));
          const newPhotos = { ...prev, [angleKey]: optimizedPhoto };
          console.log("Yeni fotoğraflar:", Object.keys(newPhotos));
          console.log("=== GALERİ SEÇİMİ TAMAMLANDI ===");
          return newPhotos;
        });

        Alert.alert(
          "Başarılı",
          `${angleKey} açısından fotoğraf seçildi. Diğer açılardan da fotoğraf seçebilirsiniz.`
        );
      }
    } catch (error) {
      console.error("=== GALERİ SEÇİMİ HATASI ===", error);
      Alert.alert(
        "Hata",
        "Fotoğraf seçilirken bir hata oluştu: " + (error as Error).message
      );
    }
  };

  const analyzePhotos = async () => {
    console.log("Analiz başlatılıyor...");
    const photoCount = Object.keys(photos).length;
    console.log("Fotoğraf sayısı:", photoCount);

    if (photoCount === 0) {
      Alert.alert("Uyarı", "En az bir fotoğraf çekmelisiniz.");
      return;
    }

    if (photoCount < 3) {
      Alert.alert(
        "Uyarı",
        "En az 3 fotoğraf çekmelisiniz (ön, arka, sol/sağ)."
      );
      return;
    }

    console.log("Analiz işlemi başlıyor...");
    setIsProcessing(true);
    try {
      // Tüm fotoğrafları analiz et
      const allDamages: any[] = [];
      let vehicleDetectionWarnings: string[] = [];
      let vehicleInfo: any = null;

      for (const [angle, photoBase64] of Object.entries(photos)) {
        try {
          // AI ile hasar tespiti yap
          const result = await aiService.detectDamages(photoBase64);

          // Araç tespit uyarısını kontrol et
          if (!result.vehicleDetected && result.warning) {
            vehicleDetectionWarnings.push(`${angle} açısı: ${result.warning}`);
          }

          // İlk araç tespit bilgilerini al
          if (!vehicleInfo && result.vehicleDetected) {
            vehicleInfo = {
              vehicleDetected: result.vehicleDetected,
              vehicleType: result.vehicleType,
              vehicleConfidence: result.vehicleConfidence,
              overallCondition: result.overallCondition,
            };
          }

          allDamages.push(
            ...result.damages.map((damage) => ({
              ...damage,
              angle: angle,
              photoBase64: photoBase64,
            }))
          );
        } catch (error) {
          console.error(`${angle} açısı analiz hatası:`, error);
          throw error; // Hatayı yukarı fırlat
        }
      }

      // Araç tespit uyarıları varsa göster
      if (vehicleDetectionWarnings.length > 0) {
        Alert.alert(
          "Araç Tespit Uyarısı",
          `Bazı fotoğraflarda araç tespit edilemedi:\n\n${vehicleDetectionWarnings.join(
            "\n"
          )}\n\nDevam etmek istiyor musunuz?`,
          [
            {
              text: "İptal",
              style: "cancel",
              onPress: () => {
                setIsProcessing(false);
                return;
              },
            },
            {
              text: "Devam Et",
              onPress: () => continueWithAnalysis(allDamages, vehicleInfo),
            },
          ]
        );
        return;
      }

      // Uyarı yoksa devam et
      await continueWithAnalysis(allDamages, vehicleInfo);
    } catch (error) {
      console.error("Analiz hatası:", error);
      Alert.alert("Hata", "Fotoğraflar analiz edilirken bir hata oluştu.");
      setIsProcessing(false);
    }
  };

  const continueWithAnalysis = async (allDamages: any[], vehicleInfo: any) => {
    try {
      // Fotoğrafları Firebase Storage'a yükle
      const uploadedImages: { [key: string]: string } = {};
      for (const [angle, photoBase64] of Object.entries(photos)) {
        const fileName = `inspection_${id}_${angle}_${Date.now()}.jpg`;
        const uploadedUrl = await storageService.uploadPhoto(
          photoBase64,
          fileName
        );
        uploadedImages[angle] = uploadedUrl;
      }

      // Eksik açıları boş string ile doldur
      const completeImages = {
        front: uploadedImages.front || "",
        back: uploadedImages.back || "",
        left: uploadedImages.left || "",
        right: uploadedImages.right || "",
        top: uploadedImages.top || "",
      };

      // İncelemeyi güncelle
      await inspectionService.updateInspectionImages(
        id as string,
        completeImages
      );

      // AI analiz sonuçlarını damages array'ine ekle
      const damagesWithVehicleInfo = [
        // Araç tespit bilgilerini ilk eleman olarak ekle
        {
          id: "vehicle_detection",
          type: "other" as any,
          severity: "minor" as any,
          location: "vehicle",
          description: "Araç tespit bilgileri",
          confidence: vehicleInfo?.vehicleConfidence || 0,
          vehicleDetected: vehicleInfo?.vehicleDetected || false,
          vehicleType: vehicleInfo?.vehicleType || "Araç",
          vehicleConfidence: vehicleInfo?.vehicleConfidence || 0,
          overallCondition: vehicleInfo?.overallCondition || "unknown",
        },
        // Gerçek hasarları ekle
        ...allDamages.map((damage, index) => ({
          ...damage,
          id: `damage_${index}`,
        })),
      ];

      // Hasar verilerini kaydet
      await inspectionService.updateInspectionDamages(
        id as string,
        damagesWithVehicleInfo
      );

      await inspectionService.updateInspectionStatus(id as string, "completed");

      // Sonuç sayfasına yönlendir
      router.push(`/inspection/result/${id}`);
    } catch (error) {
      console.error("Analiz hatası:", error);
      Alert.alert("Hata", "Fotoğraflar analiz edilirken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removePhoto = (angleKey: string) => {
    setPhotos((prev) => {
      const newPhotos = { ...prev };
      delete newPhotos[angleKey];
      return newPhotos;
    });
  };

  const goToAngle = (index: number) => {
    setCurrentAngle(index);
  };

  const currentAngleData = PHOTO_ANGLES[currentAngle];
  const photoCount = Object.keys(photos).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {currentAngleData.label} Fotoğrafı
          </Text>
          <Text style={styles.headerSubtitle}>
            {photoCount}/5 fotoğraf çekildi
          </Text>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.headerButton} onPress={testAPI}>
            <Ionicons name="wifi" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={testStorage}>
            <Ionicons name="cloud-upload" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              Alert.alert("Bilgi", "Flash özelliği yakında eklenecek")
            }
          >
            <Ionicons name="flash-off" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              Alert.alert("Bilgi", "Kamera değiştirme yakında eklenecek")
            }
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Camera Preview */}
      <View style={styles.cameraPreview}>
        {selectedPhoto ? (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${selectedPhoto}` }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closePreview}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraFrame}>
            <Ionicons name="camera" size={80} color={colors.textTertiary} />
            <Text style={[styles.cameraText, { color: colors.text }]}>
              {currentAngleData.label} Açısı
            </Text>
            <Text
              style={[styles.cameraSubtext, { color: colors.textSecondary }]}
            >
              {currentAngleData.description}
            </Text>
          </View>
        )}
      </View>

      {/* Angle Indicator */}
      <View style={styles.angleIndicator}>
        <Text style={[styles.angleText, { color: colors.text }]}>
          {currentAngleData.label} açısından fotoğraf çekin
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Photo Preview */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoPreviewRow}
        >
          {PHOTO_ANGLES.map((angle, index) => (
            <TouchableOpacity
              key={angle.key}
              style={[
                styles.angleButton,
                currentAngle === index && styles.angleButtonActive,
                photos[angle.key] && styles.angleButtonCompleted,
              ]}
              onPress={() => goToAngle(index)}
            >
              {photos[angle.key] ? (
                <Image
                  source={{
                    uri: `data:image/jpeg;base64,${photos[angle.key]}`,
                  }}
                  style={styles.angleButtonImage}
                />
              ) : (
                <Ionicons
                  name={angle.icon as any}
                  size={20}
                  color={
                    photos[angle.key]
                      ? "white"
                      : currentAngle === index
                      ? colors.primary
                      : colors.textTertiary
                  }
                />
              )}
              <Text
                style={[
                  styles.angleButtonText,
                  photos[angle.key] && styles.angleButtonTextCompleted,
                  { color: photos[angle.key] ? "white" : colors.text },
                ]}
              >
                {angle.label}
              </Text>
              {photos[angle.key] && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
              {photos[angle.key] && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(angle.key)}
                >
                  <Ionicons name="close-circle" size={16} color="white" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
            disabled={isProcessing}
          >
            <Ionicons name="images" size={24} color={colors.primary} />
          </TouchableOpacity>

          {photoCount >= 3 && (
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: colors.accent }]}
              onPress={analyzePhotos}
              disabled={isProcessing}
            >
              <Text style={styles.analyzeButtonText}>
                {isProcessing ? "Analiz Ediliyor..." : "Analiz Et"}
              </Text>
              {isProcessing && (
                <Ionicons
                  name="sync"
                  size={16}
                  color="white"
                  style={styles.spinning}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerControls: {
    flexDirection: "row",
    gap: 10,
  },
  cameraPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cameraFrame: {
    alignItems: "center",
    gap: 16,
  },
  cameraText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cameraSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  photoPreview: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  closePreview: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  angleIndicator: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  angleText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    gap: 20,
  },
  photoPreviewRow: {
    flexDirection: "row",
    gap: 12,
  },
  angleButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  angleButtonActive: {
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  angleButtonCompleted: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    borderWidth: 2,
    borderColor: "#34C759",
  },
  angleButtonImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  angleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  angleButtonTextCompleted: {
    color: "white",
  },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  analyzeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  analyzeButtonText: {
    color: "white",
    fontWeight: "600",
  },
  spinning: {
    transform: [{ rotate: "360deg" }],
  },
});
