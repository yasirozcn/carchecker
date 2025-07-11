export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
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
}

export interface InspectionReport {
  inspectionId: string;
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
