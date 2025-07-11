import { Damage } from "../types";

// Mock AI Service - Gerçek uygulamada burada API çağrısı yapılacak
export const aiService = {
  async analyzeImages(images: string[]): Promise<Damage[]> {
    // Simüle edilmiş işlem süresi
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock hasar verileri
    const mockDamages: Damage[] = [
      {
        id: "1",
        type: "scratch",
        severity: "minor",
        location: "Ön sağ kapı",
        description: "Hafif çizik, boya hasarı yok",
        confidence: 0.85,
        coordinates: { x: 0.3, y: 0.4 },
      },
      {
        id: "2",
        type: "dent",
        severity: "moderate",
        location: "Arka tampon",
        description: "Orta seviye göçük, boya hasarı var",
        confidence: 0.92,
        coordinates: { x: 0.7, y: 0.8 },
      },
      {
        id: "3",
        type: "chip",
        severity: "minor",
        location: "Ön cam",
        description: "Küçük çip, onarım gerekli",
        confidence: 0.78,
        coordinates: { x: 0.5, y: 0.2 },
      },
    ];

    return mockDamages;
  },

  async generateReport(damages: Damage[]): Promise<{
    totalDamages: number;
    severityBreakdown: { minor: number; moderate: number; severe: number };
    estimatedRepairCost: number;
    recommendations: string[];
    summary: string;
  }> {
    const severityBreakdown = {
      minor: damages.filter((d) => d.severity === "minor").length,
      moderate: damages.filter((d) => d.severity === "moderate").length,
      severe: damages.filter((d) => d.severity === "severe").length,
    };

    const estimatedRepairCost = damages.reduce((total, damage) => {
      switch (damage.severity) {
        case "minor":
          return total + 500;
        case "moderate":
          return total + 1500;
        case "severe":
          return total + 3000;
        default:
          return total;
      }
    }, 0);

    const recommendations = [];
    if (severityBreakdown.severe > 0) {
      recommendations.push("Acil onarım gerektiren hasarlar tespit edildi");
    }
    if (severityBreakdown.moderate > 0) {
      recommendations.push(
        "Orta seviye hasarlar için profesyonel onarım önerilir"
      );
    }
    if (severityBreakdown.minor > 0) {
      recommendations.push("Küçük hasarlar için yerel onarım yeterli olabilir");
    }

    const summary = `Toplam ${damages.length} hasar tespit edildi. ${severityBreakdown.severe} ciddi, ${severityBreakdown.moderate} orta, ${severityBreakdown.minor} hafif hasar bulunmaktadır.`;

    return {
      totalDamages: damages.length,
      severityBreakdown,
      estimatedRepairCost,
      recommendations,
      summary,
    };
  },
};
