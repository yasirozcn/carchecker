/**
 * Modern CarCheck uygulaması için renk paleti
 * Light ve dark mode desteği ile profesyonel tasarım
 */

const primaryColor = "#2563EB"; // Modern mavi
const secondaryColor = "#7C3AED"; // Mor
const accentColor = "#10B981"; // Yeşil
const warningColor = "#F59E0B"; // Turuncu
const errorColor = "#EF4444"; // Kırmızı

export const Colors = {
  light: {
    // Ana renkler
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    warning: warningColor,
    error: errorColor,

    // Metin renkleri
    text: "#1F2937",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    textInverse: "#FFFFFF",

    // Arka plan renkleri
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",
    surface: "#FFFFFF",

    // Navigasyon
    tint: primaryColor,
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: primaryColor,

    // Kartlar ve bileşenler
    card: "#FFFFFF",
    cardBorder: "#E5E7EB",
    input: "#F9FAFB",
    inputBorder: "#D1D5DB",

    // Durum renkleri
    success: accentColor,
    info: primaryColor,
  },
  dark: {
    // Ana renkler
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    accent: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",

    // Metin renkleri
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textTertiary: "#9CA3AF",
    textInverse: "#1F2937",

    // Arka plan renkleri
    background: "#111827",
    backgroundSecondary: "#1F2937",
    backgroundTertiary: "#374151",
    surface: "#1F2937",

    // Navigasyon
    tint: "#3B82F6",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#3B82F6",

    // Kartlar ve bileşenler
    card: "#1F2937",
    cardBorder: "#374151",
    input: "#374151",
    inputBorder: "#4B5563",

    // Durum renkleri
    success: "#34D399",
    info: "#3B82F6",
  },
};
