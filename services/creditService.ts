import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  User,
  CreditPackage,
  CreditTransaction,
  PaymentIntent,
} from "../types";

// Kredi paketleri tanımları
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_5",
    credits: 5,
    price: 20, // 5 * $4
    description: "5 kredi paketi",
  },
  {
    id: "credits_10",
    credits: 10,
    price: 35, // 10 * $3.5
    originalPrice: 40, // 10 * $4
    discount: 12.5, // %12.5 indirim
    isPopular: true,
    description: "10 kredi paketi - En popüler",
  },
  {
    id: "credits_15",
    credits: 15,
    price: 45, // 15 * $3
    originalPrice: 60, // 15 * $4
    discount: 25, // %25 indirim
    description: "15 kredi paketi - En iyi değer",
  },
];

export const creditService = {
  // Kullanıcının kredi sayısını al
  async getUserCredits(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        return userData.credits || 0;
      }
      return 0;
    } catch (error) {
      console.error("Kredi sayısı alınırken hata:", error);
      return 0;
    }
  },

  // Kullanıcının kredi sayısını güncelle
  async updateUserCredits(userId: string, credits: number): Promise<void> {
    try {
      await updateDoc(doc(db, "users", userId), {
        credits: credits,
      });
    } catch (error) {
      console.error("Kredi güncellenirken hata:", error);
      throw error;
    }
  },

  // Kredi kullan (analiz için)
  async useCredits(userId: string, inspectionId: string): Promise<boolean> {
    try {
      const userCredits = await this.getUserCredits(userId);

      if (userCredits < 1) {
        throw new Error("Yetersiz kredi");
      }

      // Kredi sayısını azalt
      await updateDoc(doc(db, "users", userId), {
        credits: increment(-1),
      });

      // Kredi kullanım işlemini kaydet
      const transaction: Omit<CreditTransaction, "id"> = {
        userId,
        type: "usage",
        credits: -1,
        description: "Araç analizi için kredi kullanımı",
        inspectionId,
        status: "completed",
        createdAt: new Date(),
        completedAt: new Date(),
      };

      await addDoc(collection(db, "creditTransactions"), transaction);

      return true;
    } catch (error) {
      console.error("Kredi kullanım hatası:", error);
      throw error;
    }
  },

  // Kredi iadesi (analiz başarısız olursa)
  async refundCredits(userId: string, inspectionId: string): Promise<void> {
    try {
      // Kredi sayısını artır
      await updateDoc(doc(db, "users", userId), {
        credits: increment(1),
      });

      // İade işlemini kaydet
      const transaction: Omit<CreditTransaction, "id"> = {
        userId,
        type: "refund",
        credits: 1,
        description: "Başarısız analiz için kredi iadesi",
        inspectionId,
        status: "completed",
        createdAt: new Date(),
        completedAt: new Date(),
      };

      await addDoc(collection(db, "creditTransactions"), transaction);
    } catch (error) {
      console.error("Kredi iadesi hatası:", error);
      throw error;
    }
  },

  // Yeni kullanıcıya deneme kredisi ver
  async giveWelcomeCredits(userId: string): Promise<void> {
    try {
      // Kullanıcının kredi sayısını 1 olarak ayarla
      await updateDoc(doc(db, "users", userId), {
        credits: 1,
      });

      // Deneme kredisi işlemini kaydet
      const transaction: Omit<CreditTransaction, "id"> = {
        userId,
        type: "bonus",
        credits: 1,
        description: "Hoş geldin deneme kredisi",
        status: "completed",
        createdAt: new Date(),
        completedAt: new Date(),
      };

      await addDoc(collection(db, "creditTransactions"), transaction);
    } catch (error) {
      console.error("Deneme kredisi verilirken hata:", error);
      throw error;
    }
  },

  // Kredi paketlerini al
  getCreditPackages(): CreditPackage[] {
    return CREDIT_PACKAGES;
  },

  // Kullanıcının işlem geçmişini al
  async getUserTransactions(userId: string): Promise<CreditTransaction[]> {
    try {
      const q = query(
        collection(db, "creditTransactions"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const transactions: CreditTransaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as CreditTransaction);
      });

      return transactions;
    } catch (error) {
      console.error("İşlem geçmişi alınırken hata:", error);
      return [];
    }
  },

  // Satın alma işlemini kaydet
  async recordPurchase(
    userId: string,
    packageId: string,
    credits: number,
    amount: number,
    paymentIntentId: string
  ): Promise<void> {
    try {
      // Kullanıcının kredi sayısını artır
      await updateDoc(doc(db, "users", userId), {
        credits: increment(credits),
        totalPurchasedCredits: increment(credits),
      });

      // Satın alma işlemini kaydet
      const transaction: Omit<CreditTransaction, "id"> = {
        userId,
        type: "purchase",
        credits: credits,
        amount: amount,
        description: `${credits} kredi satın alımı`,
        paymentIntentId: paymentIntentId,
        status: "completed",
        createdAt: new Date(),
        completedAt: new Date(),
      };

      await addDoc(collection(db, "creditTransactions"), transaction);
    } catch (error) {
      console.error("Satın alma kaydedilirken hata:", error);
      throw error;
    }
  },
};
