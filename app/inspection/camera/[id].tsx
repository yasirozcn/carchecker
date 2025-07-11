import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { inspectionService, storageService } from "../../../services/firebase";

const { width: screenWidth } = Dimensions.get("window");

const PHOTO_ANGLES = [
  { key: "front", label: "Ön", icon: "car", color: "#FF6B6B" },
  { key: "back", label: "Arka", icon: "car-sport", color: "#4ECDC4" },
  { key: "left", label: "Sol", icon: "car-outline", color: "#45B7D1" },
  { key: "right", label: "Sağ", icon: "car-sport-outline", color: "#96CEB4" },
  { key: "top", label: "Üst", icon: "car-sport-sharp", color: "#FFEAA7" },
];

export default function CameraScreen() {
  const { id } = useLocalSearchParams();
  const [currentAngle, setCurrentAngle] = useState(0);
  const [photos, setPhotos] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const takePicture = async () => {
    const angleKey = PHOTO_ANGLES[currentAngle].key;
    const angleData = PHOTO_ANGLES[currentAngle];

    // Gerçek fotoğraf çekimi simüle et
    const mockPhotoUrl = `https://via.placeholder.com/400x600/${angleData.color.replace(
      "#",
      ""
    )}/FFFFFF?text=${angleData.label}+Fotoğraf`;

    setPhotos((prev) => ({
      ...prev,
      [angleKey]: mockPhotoUrl,
    }));

    // Otomatik olarak bir sonraki açıya geç
    if (currentAngle < PHOTO_ANGLES.length - 1) {
      setTimeout(() => {
        setCurrentAngle(currentAngle + 1);
      }, 1000);
    }
  };

  const uploadPhotos = async () => {
    const photoCount = Object.keys(photos).length;
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

    setIsUploading(true);
    try {
      // Fotoğrafları Firebase Storage'a yükle (mock)
      const uploadedImages: { [key: string]: string } = {};

      for (const [angle, photoData] of Object.entries(photos)) {
        const fileName = `inspection_${id}_${angle}_${Date.now()}.jpg`;
        const uploadedUrl = await storageService.uploadPhoto(
          photoData,
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
      await inspectionService.updateInspectionStatus(
        id as string,
        "processing"
      );

      // AI analizi başlat
      setIsProcessing(true);
      await inspectionService.processInspection(id as string);

      // Sonuç sayfasına yönlendir
      router.push(`/inspection/result/${id}`);
    } catch (error) {
      Alert.alert("Hata", "Fotoğraflar yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="white" />
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
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              Alert.alert("Bilgi", "Flash özelliği test modunda devre dışı")
            }
          >
            <Ionicons name="flash-off" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              Alert.alert("Bilgi", "Kamera değiştirme test modunda devre dışı")
            }
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cameraPreview}>
        <View style={styles.cameraFrame}>
          <Ionicons name="camera" size={80} color="rgba(255,255,255,0.3)" />
          <Text style={styles.cameraText}>Test Modu</Text>
          <Text style={styles.cameraSubtext}>
            Gerçek kamera simüle ediliyor
          </Text>
        </View>
      </View>

      <View style={styles.angleIndicator}>
        <Text style={styles.angleText}>
          {currentAngleData.label} açısından fotoğraf çekin
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.photoPreview}>
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
              <Ionicons
                name={angle.icon as any}
                size={20}
                color={
                  photos[angle.key]
                    ? "white"
                    : currentAngle === index
                    ? "#007AFF"
                    : "white"
                }
              />
              <Text
                style={[
                  styles.angleButtonText,
                  photos[angle.key] && styles.angleButtonTextCompleted,
                ]}
              >
                {angle.label}
              </Text>
              {photos[angle.key] && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isUploading || isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {photoCount >= 3 && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadPhotos}
              disabled={isUploading || isProcessing}
            >
              <Text style={styles.uploadButtonText}>
                {isUploading
                  ? "Yükleniyor..."
                  : isProcessing
                  ? "Analiz Ediliyor..."
                  : "Analiz Et"}
              </Text>
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
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
  },
  headerControls: {
    flexDirection: "row",
    gap: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  cameraFrame: {
    alignItems: "center",
    padding: 40,
  },
  cameraText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginTop: 20,
  },
  cameraSubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginTop: 10,
  },
  angleIndicator: {
    position: "absolute",
    top: "60%",
    left: 20,
    right: 20,
    alignItems: "center",
  },
  angleText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 20,
    paddingBottom: 40,
  },
  photoPreview: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  angleButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    minWidth: 60,
  },
  angleButtonActive: {
    backgroundColor: "rgba(0,122,255,0.3)",
  },
  angleButtonCompleted: {
    backgroundColor: "#34C759",
  },
  angleButtonText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  angleButtonTextCompleted: {
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#34C759",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  uploadButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
