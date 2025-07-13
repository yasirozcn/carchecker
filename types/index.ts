export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  credits: number; // Kullanıcının kredi sayısı
  totalPurchasedCredits?: number; // Toplam satın alınan kredi sayısı
}

export interface CarInspection {
  id: string;
  userId: string;
  carPlate?: string;
  images: {
    front: string;
    back: string;
    left: string;
    right: string;
    top: string;
  };
  photos?: string[];
  damages: Damage[];
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export interface Damage {
  id: string;
  type: "scratch" | "dent" | "crack" | "chip" | "other";
  severity: "minor" | "moderate" | "severe";
  location: string;
  description: string;
  confidence: number;
  coordinates?: {
    x: number;
    y: number;
  };
  // AI analiz sonuçları için ek alanlar
  vehicleDetected?: boolean;
  vehicleType?: string;
  vehicleConfidence?: number;
  overallCondition?: "excellent" | "good" | "fair" | "poor" | "unknown";
}

export interface InspectionReport {
  inspectionId: string;
  userId?: string; // Kullanıcı ID'si (opsiyonel, geriye uyumluluk için)
  totalDamages: number;
  severityBreakdown: {
    minor: number;
    moderate: number;
    severe: number;
  };
  estimatedRepairCost?: number;
  recommendations: string[];
  summary: string;
}

// Kredi sistemi tipleri
export interface CreditPackage {
  id: string;
  credits: number;
  price: number; // USD cinsinden
  originalPrice?: number; // İndirim öncesi fiyat
  discount?: number; // İndirim yüzdesi
  isPopular?: boolean;
  description?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: "purchase" | "usage" | "refund" | "bonus";
  credits: number;
  amount?: number; // USD cinsinden (sadece satın alma işlemlerinde)
  description: string;
  inspectionId?: string; // Kullanım durumunda hangi inceleme için kullanıldığı
  paymentIntentId?: string; // Stripe payment intent ID
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  completedAt?: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number; // Kuruş cinsinden (Stripe formatı)
  currency: string;
  status: string;
  clientSecret: string;
}
