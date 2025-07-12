import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../config/firebase";
import { User, CarInspection, InspectionReport } from "../types";

// Auth Services
export const authService = {
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user: User = {
        id: userCredential.user.uid,
        email,
        name,
        createdAt: new Date(),
      };

      // Kullanıcı bilgilerini Firestore'a kaydet (kullanıcının kendi ID'si ile)
      await setDoc(doc(db, "users", userCredential.user.uid), user);
      return user;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};

// Storage Services
export const storageService = {
  async testStorageConnection(): Promise<boolean> {
    try {
      console.log("=== STORAGE BAĞLANTI TESTİ ===");
      console.log("Storage bucket:", storage.app.options.storageBucket);

      // Basit bir test dosyası oluştur
      const testRef = ref(storage, "test/connection-test.txt");
      const testBlob = new Blob(["test"], { type: "text/plain" });

      console.log("Test upload başlıyor...");
      const snapshot = await uploadBytes(testRef, testBlob);
      console.log("Test upload başarılı:", snapshot.metadata.name);

      // Test dosyasını sil
      // await deleteObject(testRef);

      console.log("=== STORAGE BAĞLANTI TESTİ BAŞARILI ===");
      return true;
    } catch (error) {
      console.error("=== STORAGE BAĞLANTI TESTİ BAŞARISIZ ===");
      console.error("Hata:", error);
      return false;
    }
  },
  async uploadImage(uri: string, path: string): Promise<string> {
    try {
      console.log("Firebase Storage image upload:", path);

      // URI'den blob oluştur
      const response = await fetch(uri);
      const blob = await response.blob();

      // Storage'a yükle
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("Image upload tamamlandı:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Image upload hatası:", error);
      throw error;
    }
  },

  async uploadPhoto(base64Data: string, fileName: string): Promise<string> {
    try {
      console.log("=== FIREBASE STORAGE UPLOAD BAŞLADI ===");
      console.log("Dosya adı:", fileName);
      console.log("Storage bucket:", storage.app.options.storageBucket);

      // Firebase Storage referansı oluştur
      const storageRef = ref(storage, `photos/${fileName}`);
      console.log("Storage referansı oluşturuldu:", storageRef.fullPath);

      // Base64'ü data URL formatına çevir ve fetch ile blob oluştur
      console.log("Base64'ten blob oluşturuluyor...");
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;

      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        console.log("Blob oluşturuldu, boyut:", blob.size, "bytes");

        // Storage'a yükle
        console.log("Upload başlıyor...");
        const snapshot = await uploadBytes(storageRef, blob);
        console.log("Upload tamamlandı, snapshot:", snapshot.metadata.name);

        // Download URL al
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("Download URL alındı:", downloadURL);
        console.log("=== FIREBASE STORAGE UPLOAD TAMAMLANDI ===");

        return downloadURL;
      } catch (fetchError) {
        console.error("Fetch/Blob hatası:", fetchError);
        // Alternatif yöntem: Base64'ü string olarak kaydet
        console.log(
          "Alternatif yöntem deneniyor: Base64 string olarak kaydediliyor"
        );

        // Base64'ü text dosyası olarak kaydet
        const textBlob = new Blob([base64Data], { type: "text/plain" });
        const textSnapshot = await uploadBytes(storageRef, textBlob);
        const textURL = await getDownloadURL(textSnapshot.ref);

        console.log("Base64 text olarak kaydedildi:", textURL);
        return textURL;
      }
    } catch (error) {
      console.error("=== FIREBASE STORAGE UPLOAD HATASI ===");
      console.error("Hata detayı:", error);
      console.error("Hata mesajı:", (error as Error).message);
      console.error("Hata stack:", (error as Error).stack);
      throw error; // Hatayı yukarı fırlat, mock kullanma
    }
  },
};

// Inspection Services
export const inspectionService = {
  async createInspection(userId: string, carPlate?: string): Promise<string> {
    const inspectionId = `inspection_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const inspection: CarInspection = {
      id: inspectionId,
      userId,
      carPlate,
      images: {
        front: "",
        back: "",
        left: "",
        right: "",
        top: "",
      },
      damages: [],
      status: "pending",
      createdAt: new Date(),
    };

    await setDoc(doc(db, "inspections", inspectionId), inspection);
    return inspectionId;
  },

  async updateInspectionImages(
    inspectionId: string,
    images: CarInspection["images"]
  ): Promise<void> {
    const docRef = doc(db, "inspections", inspectionId);
    await updateDoc(docRef, { images });
  },

  async updateInspectionDamages(
    inspectionId: string,
    damages: any[]
  ): Promise<void> {
    const docRef = doc(db, "inspections", inspectionId);
    await updateDoc(docRef, { damages });
  },

  async updateInspectionStatus(
    inspectionId: string,
    status: CarInspection["status"],
    damages?: any[]
  ): Promise<void> {
    const docRef = doc(db, "inspections", inspectionId);
    const updateData: any = { status };

    if (damages) {
      updateData.damages = damages;
    }

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    await updateDoc(docRef, updateData);
  },

  async processInspection(inspectionId: string): Promise<void> {
    try {
      // İncelemeyi al
      const inspection = await this.getInspection(inspectionId);
      if (!inspection) return;

      // AI analizi için fotoğrafları hazırla
      const imageUrls = Object.values(inspection.images).filter((url) => url);

      if (imageUrls.length === 0) {
        await this.updateInspectionStatus(inspectionId, "failed");
        return;
      }

      // Gerçek fotoğraf verilerini al ve AI analizi yap
      const { aiService } = await import("./aiService");

      // İlk fotoğrafı kullan (gerçek base64 verisi olmalı)
      const firstImageUrl = imageUrls[0];
      if (!firstImageUrl || firstImageUrl === "mock_image_data") {
        throw new Error("Geçerli fotoğraf verisi bulunamadı");
      }

      // URL'den base64 verisini çıkar (eğer data URL ise)
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

      const result = await aiService.detectDamages(base64Data);

      // AI analiz sonuçlarını damages array'ine ekle
      const damagesWithVehicleInfo = [
        // Araç tespit bilgilerini ilk eleman olarak ekle
        {
          id: "vehicle_detection",
          type: "other" as any,
          severity: "minor" as any,
          location: "vehicle",
          description: "Araç tespit bilgileri",
          confidence: result.vehicleConfidence || 0,
          vehicleDetected: result.vehicleDetected,
          vehicleType: result.vehicleType,
          vehicleConfidence: result.vehicleConfidence,
          overallCondition: result.overallCondition,
        },
        // Gerçek hasarları ekle
        ...result.damages.map((damage, index) => ({
          ...damage,
          id: `damage_${index}`,
        })),
      ];

      // Rapor oluştur
      const report = {
        totalDamages: result.totalDamages,
        severityBreakdown: {
          minor: result.damages.filter((d) => d.severity === "minor").length,
          moderate: result.damages.filter((d) => d.severity === "moderate")
            .length,
          severe: result.damages.filter((d) => d.severity === "severe").length,
        },
        estimatedRepairCost: result.estimatedRepairCost,
        recommendations: result.recommendations,
        summary: `Toplam ${result.totalDamages} hasar tespit edildi.`,
      };

      // İncelemeyi güncelle - AI analiz sonuçlarını da dahil et
      await this.updateInspectionStatus(
        inspectionId,
        "completed",
        damagesWithVehicleInfo
      );

      // Raporu kaydet
      const { reportService } = await import("./firebase");
      await reportService.createReport({
        inspectionId,
        userId: inspection.userId, // Kullanıcı ID'sini ekle
        totalDamages: report.totalDamages,
        severityBreakdown: report.severityBreakdown,
        estimatedRepairCost: report.estimatedRepairCost,
        recommendations: report.recommendations,
        summary: report.summary,
      });
    } catch (error) {
      console.error("AI analizi hatası:", error);
      await this.updateInspectionStatus(inspectionId, "failed");
    }
  },

  async updateInspection(
    inspectionId: string,
    data: Partial<CarInspection>
  ): Promise<void> {
    const docRef = doc(db, "inspections", inspectionId);
    await updateDoc(docRef, data);
  },

  async getInspection(inspectionId: string): Promise<CarInspection | null> {
    const docRef = doc(db, "inspections", inspectionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CarInspection;
    }
    return null;
  },

  async getUserInspections(userId: string): Promise<CarInspection[]> {
    try {
      const q = query(
        collection(db, "inspections"),
        where("userId", "==", userId)
        // orderBy kaldırıldı - index gerektiriyor
      );

      const querySnapshot = await getDocs(q);
      const inspections = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as CarInspection)
      );

      // Manuel sıralama
      return inspections.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("getUserInspections error:", error);
      return [];
    }
  },

  async deleteInspection(inspectionId: string): Promise<void> {
    try {
      // İncelemeyi sil
      await deleteDoc(doc(db, "inspections", inspectionId));

      // İlgili raporu da sil
      const q = query(
        collection(db, "reports"),
        where("inspectionId", "==", inspectionId)
      );
      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
      }
    } catch (error) {
      console.error("deleteInspection error:", error);
      throw error;
    }
  },
};

// Report Services
export const reportService = {
  async createReport(report: InspectionReport): Promise<string> {
    const docRef = await addDoc(collection(db, "reports"), report);
    return docRef.id;
  },

  async getReport(inspectionId: string): Promise<InspectionReport | null> {
    const q = query(
      collection(db, "reports"),
      where("inspectionId", "==", inspectionId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as InspectionReport;
    }
    return null;
  },

  async getAllReports(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("getAllReports error:", error);
      return [];
    }
  },

  async getUserReports(userId: string): Promise<any[]> {
    try {
      // Önce kullanıcının incelemelerini al
      const userInspections = await inspectionService.getUserInspections(
        userId
      );
      const inspectionIds = userInspections.map((inspection) => inspection.id);

      // Bu incelemelere ait raporları al
      const reports: any[] = [];

      for (const inspectionId of inspectionIds) {
        const report = await this.getReport(inspectionId);
        if (report) {
          reports.push({
            ...report,
            inspectionId,
            inspection: userInspections.find((i) => i.id === inspectionId),
          });
        }
      }

      // Ayrıca userId ile direkt filtreleme de yap
      const q = query(collection(db, "reports"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const directReports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // İki yöntemi birleştir ve tekrarları kaldır
      const allReports = [...reports, ...directReports];
      const uniqueReports = allReports.filter(
        (report, index, self) =>
          index ===
          self.findIndex((r) => r.inspectionId === report.inspectionId)
      );

      return uniqueReports;
    } catch (error) {
      console.error("getUserReports error:", error);
      return [];
    }
  },
};
