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
import { db, auth } from "../config/firebase";
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

// Storage Services - Geçici olarak mock data kullanıyoruz
export const storageService = {
  async uploadImage(uri: string, path: string): Promise<string> {
    // Storage henüz etkinleştirilmediği için mock URL döndürüyoruz
    console.log("Mock storage upload:", path);
    return `mock://storage/${path}`;
  },

  async uploadPhoto(base64Data: string, fileName: string): Promise<string> {
    // Base64 fotoğrafı mock URL'e çevir
    console.log("Mock photo upload:", fileName);
    return `mock://storage/photos/${fileName}`;
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

      // AI analizi yap
      const { aiService } = await import("./aiService");
      const damages = await aiService.analyzeImages(imageUrls);

      // Rapor oluştur
      const report = await aiService.generateReport(damages);

      // İncelemeyi güncelle
      await this.updateInspectionStatus(inspectionId, "completed", damages);

      // Raporu kaydet
      const { reportService } = await import("./firebase");
      await reportService.createReport({
        inspectionId,
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
};
