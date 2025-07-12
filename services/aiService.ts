import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export interface DamageDetection {
  type: "scratch" | "dent" | "crack" | "chip" | "other";
  severity: "minor" | "moderate" | "severe";
  confidence: number;
  location: string;
  description: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CarInspectionResult {
  damages: DamageDetection[];
  overallCondition: "excellent" | "good" | "fair" | "poor";
  totalDamages: number;
  estimatedRepairCost?: number;
  recommendations: string[];
  vehicleDetected: boolean;
  vehicleType?: string;
  vehicleConfidence?: number;
  warning?: string;
}

class AIService {
  private apiKey: string;
  private baseUrl = "https://vision.googleapis.com/v1/images:annotate";

  constructor() {
    // API key'i environment variable'dan al ve temizle
    this.apiKey = (process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY || "").replace(
      /%$/,
      ""
    );

    console.log("=== AI SERVICE BAŞLATILIYOR ===");
    console.log(
      "EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY:",
      process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY ? "Mevcut" : "Yok"
    );
    console.log(
      "GOOGLE_CLOUD_API_KEY:",
      process.env.GOOGLE_CLOUD_API_KEY ? "Mevcut" : "Yok"
    );
    console.log("API_KEY:", process.env.API_KEY ? "Mevcut" : "Yok");

    // Alternatif environment variable'ları dene
    if (!this.apiKey) {
      this.apiKey = (process.env.GOOGLE_CLOUD_API_KEY || "").replace(/%$/, "");
      console.log(
        "GOOGLE_CLOUD_API_KEY deneniyor:",
        this.apiKey ? "Bulundu" : "Bulunamadı"
      );
    }

    if (!this.apiKey) {
      this.apiKey = (process.env.API_KEY || "").replace(/%$/, "");
      console.log("API_KEY deneniyor:", this.apiKey ? "Bulundu" : "Bulunamadı");
    }

    if (!this.apiKey) {
      console.error(
        "Google Cloud API Key bulunamadı! Lütfen EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY environment variable'ını ayarlayın."
      );
      console.log(
        "Mevcut environment variables:",
        Object.keys(process.env).filter(
          (key) => key.includes("API") || key.includes("KEY")
        )
      );
    } else {
      console.log("API Key yüklendi:", this.apiKey.substring(0, 10) + "...");
      console.log("API Key uzunluğu:", this.apiKey.length);
    }
  }

  /**
   * API key'i test et
   */
  async testAPIKey(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error("API Key bulunamadı");
      }

      // Basit bir test isteği gönder
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content:
                  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // 1x1 pixel
              },
              features: [
                {
                  type: "LABEL_DETECTION",
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Test Hatası:", response.status, errorText);
        return false;
      }

      const data = await response.json();
      console.log("API Test Başarılı:", data);
      return true;
    } catch (error) {
      console.error("API Test Hatası:", error);
      return false;
    }
  }

  /**
   * Kamera izni iste
   */
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    }
    return true;
  }

  /**
   * Galeri izni iste
   */
  async requestGalleryPermission(): Promise<boolean> {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
    return true;
  }

  /**
   * Kamera ile fotoğraf çek
   */
  async takePhoto(): Promise<string | null> {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        throw new Error("Kamera izni verilmedi");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Kaliteyi düşür
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].base64 || null;
      }
      return null;
    } catch (error) {
      console.error("Fotoğraf çekme hatası:", error);
      throw error;
    }
  }

  /**
   * Galeriden fotoğraf seç
   */
  async pickImage(): Promise<string | null> {
    try {
      const hasPermission = await this.requestGalleryPermission();
      if (!hasPermission) {
        throw new Error("Galeri izni verilmedi");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Kaliteyi düşür
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].base64 || null;
      }
      return null;
    } catch (error) {
      console.error("Fotoğraf seçme hatası:", error);
      throw error;
    }
  }

  /**
   * Resmi optimize et
   */
  async optimizeImage(base64Image: string): Promise<string> {
    try {
      const uri = `data:image/jpeg;base64,${base64Image}`;
      const result = await manipulateAsync(
        uri,
        [
          { resize: { width: 800 } }, // Genişliği daha da küçült
        ],
        {
          compress: 0.6, // Sıkıştırmayı artır
          format: SaveFormat.JPEG,
          base64: true,
        }
      );

      return result.base64 || base64Image;
    } catch (error) {
      console.error("Resim optimizasyon hatası:", error);
      return base64Image;
    }
  }

  /**
   * Google Cloud Vision AI ile hasar tespiti yap
   */
  async detectDamages(base64Image: string): Promise<CarInspectionResult> {
    try {
      if (!this.apiKey) {
        throw new Error(
          "API Key bulunamadı. Lütfen Google Cloud Vision API key'ini ayarlayın."
        );
      }

      console.log("=== AI ANALİZ BAŞLADI ===");
      console.log("API Key mevcut:", !!this.apiKey);
      console.log("API Key başlangıcı:", this.apiKey.substring(0, 20) + "...");

      // Resmi optimize et
      const optimizedImage = await this.optimizeImage(base64Image);
      console.log("Resim optimize edildi, boyut:", optimizedImage.length);

      // Google Cloud Vision API'ye gönder
      console.log("API'ye istek gönderiliyor...");
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: optimizedImage,
              },
              features: [
                {
                  type: "LABEL_DETECTION",
                  maxResults: 20,
                },
                {
                  type: "OBJECT_LOCALIZATION",
                  maxResults: 10,
                },
                {
                  type: "TEXT_DETECTION",
                  maxResults: 5,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Hatası:", response.status, errorText);
        throw new Error(`API Hatası: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("=== API YANITI ===");
      console.log("API yanıtı alındı, boyut:", JSON.stringify(data).length);
      console.log(
        "Label sayısı:",
        data.responses?.[0]?.labelAnnotations?.length || 0
      );
      console.log(
        "Obje sayısı:",
        data.responses?.[0]?.localizedObjectAnnotations?.length || 0
      );

      // İlk birkaç label'ı logla
      if (data.responses?.[0]?.labelAnnotations) {
        console.log("İlk 5 label:");
        data.responses[0].labelAnnotations
          .slice(0, 5)
          .forEach((label: any, index: number) => {
            console.log(
              `${index + 1}. ${label.description} (${(
                label.score * 100
              ).toFixed(1)}%)`
            );
          });
      }

      // İlk birkaç objeyi logla
      if (data.responses?.[0]?.localizedObjectAnnotations) {
        console.log("İlk 5 obje:");
        data.responses[0].localizedObjectAnnotations
          .slice(0, 5)
          .forEach((obj: any, index: number) => {
            console.log(
              `${index + 1}. ${obj.name} (${(obj.score * 100).toFixed(1)}%)`
            );
          });
      }

      // Sonuçları analiz et ve hasarları tespit et
      const result = this.analyzeVisionResults(data);
      console.log("=== ANALİZ SONUCU ===");
      console.log("Araç tespit edildi:", result.vehicleDetected);
      console.log("Araç tipi:", result.vehicleType);
      console.log("Araç güven oranı:", result.vehicleConfidence);
      console.log("Hasar sayısı:", result.damages.length);
      console.log("Genel durum:", result.overallCondition);

      return result;
    } catch (error) {
      console.error("=== AI ANALİZ HATASI ===", error);
      throw error;
    }
  }

  /**
   * Vision API sonuçlarını analiz et
   */
  private analyzeVisionResults(visionData: any): CarInspectionResult {
    console.log("=== VISION ANALİZ BAŞLADI ===");

    const damages: DamageDetection[] = [];
    const labels = visionData.responses[0]?.labelAnnotations || [];
    const objects = visionData.responses[0]?.localizedObjectAnnotations || [];

    console.log("Toplam label sayısı:", labels.length);
    console.log("Toplam obje sayısı:", objects.length);

    // Araç tespiti için anahtar kelimeler
    const vehicleKeywords = [
      "car",
      "vehicle",
      "automobile",
      "truck",
      "van",
      "suv",
      "sedan",
      "hatchback",
      "wagon",
      "coupe",
      "convertible",
      "pickup",
      "minivan",
      "bus",
      "motorcycle",
      "araç",
      "otomobil",
      "kamyon",
      "minibüs",
      "motosiklet",
      "taksi",
    ];

    // Araç tespiti yap
    let vehicleDetected = false;
    let vehicleType = "";
    let vehicleConfidence = 0;
    let allVehicleConfidences: number[] = [];

    console.log("Araç tespiti başlıyor...");

    // Label'lardan araç tespiti
    labels.forEach((label: any) => {
      const labelText = label.description.toLowerCase();
      const confidence = label.score;

      if (vehicleKeywords.some((keyword) => labelText.includes(keyword))) {
        console.log(
          `Araç tespit edildi (label): ${label.description} (${(
            confidence * 100
          ).toFixed(1)}%)`
        );
        vehicleDetected = true;
        allVehicleConfidences.push(confidence);

        if (confidence > vehicleConfidence) {
          vehicleType = label.description;
          vehicleConfidence = confidence;
        }
      }
    });

    // Obje tespitinden araç kontrolü
    objects.forEach((object: any) => {
      const objectName = object.name.toLowerCase();
      if (vehicleKeywords.some((keyword) => objectName.includes(keyword))) {
        console.log(
          `Araç tespit edildi (obje): ${object.name} (${(
            object.score * 100
          ).toFixed(1)}%)`
        );
        vehicleDetected = true;
        allVehicleConfidences.push(object.score);

        if (object.score > vehicleConfidence) {
          vehicleType = object.name;
          vehicleConfidence = object.score;
        }
      }
    });

    // Ortalama güven oranını hesapla (birden fazla araç tespiti varsa)
    if (allVehicleConfidences.length > 0) {
      vehicleConfidence =
        allVehicleConfidences.reduce((sum, conf) => sum + conf, 0) /
        allVehicleConfidences.length;
      console.log(
        `Ortalama araç güven oranı: ${(vehicleConfidence * 100).toFixed(1)}%`
      );
    }

    // Araç tespit edilmediyse uyarı döndür
    if (!vehicleDetected) {
      console.log("Araç tespit edilemedi!");
      return {
        damages: [],
        overallCondition: "excellent",
        totalDamages: 0,
        estimatedRepairCost: 0,
        recommendations: [
          "Araç tespit edilemedi. Lütfen araç fotoğrafı çektiğinizden emin olun.",
        ],
        vehicleDetected: false,
        vehicleType: "",
        vehicleConfidence: 0,
        warning:
          "Bu fotoğrafta araç tespit edilemedi. Lütfen araç fotoğrafı çekin veya farklı bir açı deneyin.",
      };
    }

    console.log(
      `Araç tespit edildi: ${vehicleType} (${(vehicleConfidence * 100).toFixed(
        1
      )}%)`
    );

    // Hasar tespiti için anahtar kelimeler
    const damageKeywords = {
      scratch: ["çizik", "scratch", "scratched", "damage", "hasar", "abrasion"],
      dent: [
        "göçük",
        "dent",
        "dented",
        "crash",
        "çarpma",
        "deformation",
        "bump",
      ],
      crack: [
        "çatlak",
        "crack",
        "cracked",
        "broken",
        "kırık",
        "fracture",
        "split",
      ],
      chip: ["çip", "chip", "chipped", "missing", "eksik", "piece", "fragment"],
    };

    // Özel hasar tespit formatları (örn: "Bumper -> dent")
    const specialDamagePatterns = [
      { pattern: /bumper\s*->\s*dent/i, type: "dent", location: "Tampon" },
      { pattern: /fender\s*->\s*dent/i, type: "dent", location: "Çamurluk" },
      { pattern: /door\s*->\s*dent/i, type: "dent", location: "Kapı" },
      { pattern: /hood\s*->\s*dent/i, type: "dent", location: "Motor Kapağı" },
      {
        pattern: /bumper\s*->\s*scratch/i,
        type: "scratch",
        location: "Tampon",
      },
      {
        pattern: /fender\s*->\s*scratch/i,
        type: "scratch",
        location: "Çamurluk",
      },
      {
        pattern: /windshield\s*->\s*crack/i,
        type: "crack",
        location: "Ön Cam",
      },
      { pattern: /glass\s*->\s*crack/i, type: "crack", location: "Cam" },
    ];

    console.log("Hasar tespiti başlıyor...");

    // Label'lardan hasar tespiti
    labels.forEach((label: any) => {
      const labelText = label.description.toLowerCase();
      const confidence = label.score;
      let damageDetected = false;

      // Önce özel hasar formatlarını kontrol et
      for (const pattern of specialDamagePatterns) {
        if (pattern.pattern.test(label.description)) {
          console.log(
            `Hasar tespit edildi: ${label.description} -> ${pattern.type} (${(
              confidence * 100
            ).toFixed(1)}%)`
          );

          damages.push({
            type: pattern.type as any,
            severity: this.determineSeverity(confidence),
            confidence: confidence,
            location: pattern.location,
            description: `${label.description} tespit edildi`,
          });
          damageDetected = true;
          break;
        }
      }

      // Özel format bulunamadıysa genel anahtar kelime kontrolü yap
      if (!damageDetected) {
        for (const [damageType, keywords] of Object.entries(damageKeywords)) {
          if (keywords.some((keyword) => labelText.includes(keyword))) {
            console.log(
              `Hasar tespit edildi: ${label.description} -> ${damageType} (${(
                confidence * 100
              ).toFixed(1)}%)`
            );

            // Hasar konumunu daha detaylı analiz et
            const location = this.determineLocationFromLabel(
              label.description,
              damageType
            );

            damages.push({
              type: damageType as any,
              severity: this.determineSeverity(confidence),
              confidence: confidence,
              location: location,
              description: `${label.description} tespit edildi`,
            });
            break;
          }
        }
      }
    });

    // Obje tespitinden hasar analizi
    objects.forEach((object: any) => {
      const objectName = object.name.toLowerCase();
      if (objectName.includes("car") || objectName.includes("vehicle")) {
        // Araç tespit edildi, detaylı analiz yap
        this.analyzeVehicleDamage(object, damages);
      }
    });

    console.log(`Toplam hasar sayısı: ${damages.length}`);

    // Genel durum değerlendirmesi
    const overallCondition = this.determineOverallCondition(damages);
    const totalDamages = damages.length;
    const estimatedRepairCost = this.estimateRepairCost(damages);
    const recommendations = this.generateRecommendations(damages, vehicleType);

    console.log("=== VISION ANALİZ TAMAMLANDI ===");

    return {
      damages,
      overallCondition,
      totalDamages,
      estimatedRepairCost,
      recommendations,
      vehicleDetected: true,
      vehicleType,
      vehicleConfidence,
    };
  }

  /**
   * Hasar şiddetini belirle
   */
  private determineSeverity(
    confidence: number
  ): "minor" | "moderate" | "severe" {
    if (confidence > 0.8) return "severe";
    if (confidence > 0.6) return "moderate";
    return "minor";
  }

  /**
   * Hasar konumunu belirle
   */
  private determineLocation(labelText: string): string {
    const locationKeywords = {
      ön: ["front", "ön", "bumper", "grill"],
      arka: ["back", "arka", "rear", "trunk"],
      sağ: ["right", "sağ", "passenger"],
      sol: ["left", "sol", "driver"],
      kapı: ["door", "kapı", "handle"],
      çamurluk: ["fender", "çamurluk", "wing"],
      tampon: ["bumper", "tampon", "buffer"],
      cam: ["window", "cam", "glass", "windshield"],
      far: ["headlight", "far", "light", "lamp"],
      stop: ["taillight", "stop", "brake light"],
    };

    for (const [location, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some((keyword) => labelText.includes(keyword))) {
        return location;
      }
    }

    return "Belirsiz konum";
  }

  /**
   * Label'dan hasar konumunu daha detaylı analiz et
   */
  private determineLocationFromLabel(
    labelDescription: string,
    damageType: string
  ): string {
    const labelText = labelDescription.toLowerCase();

    // AI'dan gelen spesifik hasar tespitlerini analiz et
    if (labelText.includes("bumper")) {
      // Bumper hasarı - ön veya arka olabilir
      if (labelText.includes("front") || labelText.includes("ön")) {
        return "Ön Tampon";
      } else if (
        labelText.includes("back") ||
        labelText.includes("arka") ||
        labelText.includes("rear")
      ) {
        return "Arka Tampon";
      } else {
        return "Tampon";
      }
    }

    if (labelText.includes("fender") || labelText.includes("çamurluk")) {
      if (labelText.includes("front") || labelText.includes("ön")) {
        return "Ön Çamurluk";
      } else if (labelText.includes("back") || labelText.includes("arka")) {
        return "Arka Çamurluk";
      } else {
        return "Çamurluk";
      }
    }

    if (labelText.includes("door") || labelText.includes("kapı")) {
      if (labelText.includes("front") || labelText.includes("ön")) {
        return "Ön Kapı";
      } else if (labelText.includes("back") || labelText.includes("arka")) {
        return "Arka Kapı";
      } else if (labelText.includes("driver") || labelText.includes("sol")) {
        return "Sol Kapı";
      } else if (labelText.includes("passenger") || labelText.includes("sağ")) {
        return "Sağ Kapı";
      } else {
        return "Kapı";
      }
    }

    if (labelText.includes("hood") || labelText.includes("motor kapağı")) {
      return "Motor Kapağı";
    }

    if (labelText.includes("trunk") || labelText.includes("bagaj")) {
      return "Bagaj Kapağı";
    }

    if (labelText.includes("windshield") || labelText.includes("ön cam")) {
      return "Ön Cam";
    }

    if (labelText.includes("headlight") || labelText.includes("far")) {
      if (labelText.includes("front") || labelText.includes("ön")) {
        return "Ön Far";
      } else if (labelText.includes("back") || labelText.includes("arka")) {
        return "Arka Far";
      } else {
        return "Far";
      }
    }

    if (labelText.includes("taillight") || labelText.includes("stop")) {
      return "Stop Lambası";
    }

    if (labelText.includes("wheel") || labelText.includes("tekerlek")) {
      return "Tekerlek";
    }

    if (labelText.includes("mirror") || labelText.includes("ayna")) {
      if (labelText.includes("left") || labelText.includes("sol")) {
        return "Sol Ayna";
      } else if (labelText.includes("right") || labelText.includes("sağ")) {
        return "Sağ Ayna";
      } else {
        return "Ayna";
      }
    }

    // Genel konum tespiti
    const locationKeywords = {
      Ön: ["front", "ön", "forward"],
      Arka: ["back", "arka", "rear"],
      Sağ: ["right", "sağ", "passenger"],
      Sol: ["left", "sol", "driver"],
      Üst: ["top", "üst", "roof"],
      Alt: ["bottom", "alt", "under"],
    };

    for (const [location, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some((keyword) => labelText.includes(keyword))) {
        return location;
      }
    }

    // Hasar tipine göre genel konum
    switch (damageType) {
      case "dent":
        return "Gövde";
      case "scratch":
        return "Yüzey";
      case "crack":
        return "Cam/Yüzey";
      case "chip":
        return "Detay";
      default:
        return "Belirsiz Konum";
    }
  }

  /**
   * Araç hasarını detaylı analiz et
   */
  private analyzeVehicleDamage(object: any, damages: DamageDetection[]) {
    // Burada daha detaylı araç hasar analizi yapılabilir
    // Örneğin: bounding box koordinatları, hasar yoğunluğu vb.
  }

  /**
   * Genel durumu belirle
   */
  private determineOverallCondition(
    damages: DamageDetection[]
  ): "excellent" | "good" | "fair" | "poor" {
    if (damages.length === 0) return "excellent";

    const severeCount = damages.filter((d) => d.severity === "severe").length;
    const moderateCount = damages.filter(
      (d) => d.severity === "moderate"
    ).length;

    if (severeCount > 2) return "poor";
    if (severeCount > 0 || moderateCount > 3) return "fair";
    if (moderateCount > 0 || damages.length > 2) return "good";
    return "excellent";
  }

  /**
   * Onarım maliyetini tahmin et
   */
  private estimateRepairCost(damages: DamageDetection[]): number {
    let totalCost = 0;

    damages.forEach((damage) => {
      switch (damage.type) {
        case "scratch":
          totalCost +=
            damage.severity === "severe"
              ? 500
              : damage.severity === "moderate"
              ? 200
              : 50;
          break;
        case "dent":
          totalCost +=
            damage.severity === "severe"
              ? 800
              : damage.severity === "moderate"
              ? 400
              : 150;
          break;
        case "crack":
          totalCost +=
            damage.severity === "severe"
              ? 1200
              : damage.severity === "moderate"
              ? 600
              : 200;
          break;
        case "chip":
          totalCost +=
            damage.severity === "severe"
              ? 300
              : damage.severity === "moderate"
              ? 150
              : 30;
          break;
        default:
          totalCost += 100;
      }
    });

    return totalCost;
  }

  /**
   * Öneriler oluştur
   */
  private generateRecommendations(
    damages: DamageDetection[],
    vehicleType?: string
  ): string[] {
    const recommendations: string[] = [];

    if (damages.length === 0) {
      recommendations.push(
        `${
          vehicleType || "Araç"
        } durumu mükemmel! Herhangi bir hasar tespit edilmedi.`
      );
      return recommendations;
    }

    const severeDamages = damages.filter((d) => d.severity === "severe");
    const moderateDamages = damages.filter((d) => d.severity === "moderate");

    if (severeDamages.length > 0) {
      recommendations.push(
        "Ciddi hasarlar tespit edildi. Acil onarım önerilir."
      );
    }

    if (moderateDamages.length > 0) {
      recommendations.push(
        "Orta seviye hasarlar mevcut. Yakın zamanda onarım yapılmalı."
      );
    }

    if (damages.some((d) => d.type === "crack")) {
      recommendations.push(
        "Çatlak hasarlar tespit edildi. Güvenlik için kontrol edilmeli."
      );
    }

    recommendations.push("Detaylı inceleme için profesyonel servise başvurun.");

    return recommendations;
  }
}

export const aiService = new AIService();
