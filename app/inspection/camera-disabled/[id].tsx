import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Camera, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../../../components/ui/Button";
import { inspectionService, storageService } from "../../../services/firebase";

type ImagePosition = "front" | "back" | "left" | "right" | "top";

interface ImageData {
  uri: string;
  uploaded: boolean;
}

export default function CameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [images, setImages] = useState<Record<ImagePosition, ImageData>>({
    front: { uri: "", uploaded: false },
    back: { uri: "", uploaded: false },
    left: { uri: "", uploaded: false },
    right: { uri: "", uploaded: false },
    top: { uri: "", uploaded: false },
  });
  const [currentPosition, setCurrentPosition] =
    useState<ImagePosition>("front");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      try {
        const photo = await camera.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        setImages((prev) => ({
          ...prev,
          [currentPosition]: { uri: photo.uri, uploaded: false },
        }));
      } catch {
        Alert.alert("Hata", "Fotoğraf çekilemedi");
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages((prev) => ({
        ...prev,
        [currentPosition]: { uri: result.assets[0].uri, uploaded: false },
      }));
    }
  };

  const uploadImages = async () => {
    const imagePositions: ImagePosition[] = [
      "front",
      "back",
      "left",
      "right",
      "top",
    ];
    const missingImages = imagePositions.filter((pos) => !images[pos]?.uri);

    if (missingImages.length > 0) {
      Alert.alert("Eksik Resimler", "Lütfen tüm açılardan resim çekin");
      return;
    }

    setUploading(true);
    try {
      const uploadedImages: Record<ImagePosition, string> = {} as Record<
        ImagePosition,
        string
      >;

      for (const position of imagePositions) {
        const imageUri = images[position]?.uri;
        if (!imageUri) continue;
        const path = `inspections/${id}/${position}.jpg`;
        const downloadUrl = await storageService.uploadImage(imageUri, path);
        uploadedImages[position] = downloadUrl;
      }

      await inspectionService.updateInspectionImages(id, uploadedImages);
      await inspectionService.updateInspectionStatus(id, "processing");

      // Yapay zeka analizi
      try {
        const imageUrls = Object.values(uploadedImages);
        if (imageUrls.length > 0) {
          // İlk fotoğrafı kullanarak AI analizi yap
          const firstImageUrl = imageUrls[0];

          // URL'den base64 verisini çıkar
          let base64Data = firstImageUrl;
          if (firstImageUrl.startsWith("data:image")) {
            base64Data = firstImageUrl.split(",")[1];
          } else if (firstImageUrl.startsWith("http")) {
            // HTTP URL'den base64'e çevir
            const response = await fetch(firstImageUrl);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            base64Data = btoa(String.fromCharCode(...uint8Array));
          }

          const { aiService } = await import("../../../services/aiService");
          const result = await aiService.detectDamages(base64Data);

          await inspectionService.updateInspectionStatus(
            id,
            "completed",
            result.damages
          );
        }
        router.push(`/inspection/result/${id}`);
      } catch {
        await inspectionService.updateInspectionStatus(id, "failed");
        Alert.alert("Hata", "Analiz sırasında bir hata oluştu");
      }
    } catch {
      Alert.alert("Hata", "Resimler yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const getPositionText = (position: ImagePosition): string => {
    switch (position) {
      case "front":
        return "Ön";
      case "back":
        return "Arka";
      case "left":
        return "Sol";
      case "right":
        return "Sağ";
      case "top":
        return "Üst";
      default:
        return position;
    }
  };

  const getPositionDescription = (position: ImagePosition): string => {
    switch (position) {
      case "front":
        return "Aracın ön kısmını çekin";
      case "back":
        return "Aracın arka kısmını çekin";
      case "left":
        return "Aracın sol tarafını çekin";
      case "right":
        return "Aracın sağ tarafını çekin";
      case "top":
        return "Aracın üst kısmını çekin";
      default:
        return "";
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Kamera izni isteniyor...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Kamera erişimi reddedildi</Text>
        <Button title="Geri Dön" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Araç Fotoğrafları</Text>
          <Text style={styles.subtitle}>
            {getPositionDescription(currentPosition)}
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          {images[currentPosition].uri ? (
            <Image
              source={{ uri: images[currentPosition].uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <Camera
              ref={(ref) => setCamera(ref)}
              style={styles.camera}
              type={CameraType.back}
            />
          )}
        </View>

        <View style={styles.controls}>
          {!images[currentPosition].uri ? (
            <View style={styles.cameraControls}>
              <Button
                title="Fotoğraf Çek"
                onPress={takePicture}
                style={styles.captureButton}
              />
              <Button
                title="Galeriden Seç"
                onPress={pickImage}
                variant="outline"
                style={styles.galleryButton}
              />
            </View>
          ) : (
            <View style={styles.previewControls}>
              <Button
                title="Yeniden Çek"
                onPress={() =>
                  setImages((prev) => ({
                    ...prev,
                    [currentPosition]: { uri: "", uploaded: false },
                  }))
                }
                variant="outline"
                style={styles.retakeButton}
              />
            </View>
          )}
        </View>

        <View style={styles.positions}>
          <Text style={styles.positionsTitle}>Fotoğraf Pozisyonları</Text>
          <View style={styles.positionButtons}>
            {(["front", "back", "left", "right", "top"] as ImagePosition[]).map(
              (position) => (
                <Button
                  key={position}
                  title={getPositionText(position)}
                  onPress={() => setCurrentPosition(position)}
                  variant={currentPosition === position ? "primary" : "outline"}
                  size="small"
                  style={[
                    styles.positionButton,
                    images[position].uri && styles.completedPosition,
                  ]}
                />
              )
            )}
          </View>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressTitle}>İlerleme</Text>
          <View style={styles.progressBar}>
            {(["front", "back", "left", "right", "top"] as ImagePosition[]).map(
              (position, index) => (
                <View
                  key={position}
                  style={[
                    styles.progressDot,
                    images[position].uri && styles.completedDot,
                    index < 4 && styles.progressLine,
                  ]}
                />
              )
            )}
          </View>
          <Text style={styles.progressText}>
            {Object.values(images).filter((img) => img.uri).length} / 5 fotoğraf
            tamamlandı
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Analizi Başlat"
            onPress={uploadImages}
            loading={uploading}
            disabled={Object.values(images).some((img) => !img.uri)}
            size="large"
            style={styles.analyzeButton}
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
  cameraContainer: {
    margin: 24,
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  cameraControls: {
    flexDirection: "row",
    gap: 12,
  },
  captureButton: {
    flex: 1,
  },
  galleryButton: {
    flex: 1,
  },
  previewControls: {
    alignItems: "center",
  },
  retakeButton: {
    minWidth: 120,
  },
  positions: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  positionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  positionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  positionButton: {
    minWidth: 80,
  },
  completedPosition: {
    backgroundColor: "#10B981",
  },
  progress: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  completedDot: {
    backgroundColor: "#10B981",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  analyzeButton: {
    backgroundColor: "#10B981",
  },
});
