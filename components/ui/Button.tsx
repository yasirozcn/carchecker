import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getGradientColors = () => {
    if (disabled || loading) return ["#9CA3AF", "#6B7280"];

    switch (variant) {
      case "primary":
        return ["#3B82F6", "#1D4ED8"];
      case "secondary":
        return ["#10B981", "#059669"];
      case "outline":
        return ["transparent", "transparent"];
      default:
        return ["#3B82F6", "#1D4ED8"];
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    if (variant === "outline") {
      return {
        ...baseStyle,
        ...sizeStyles[size],
        borderWidth: 2,
        borderColor: "#3B82F6",
        backgroundColor: "transparent",
      };
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: "600",
      textAlign: "center",
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: "#FFFFFF" },
      secondary: { color: "#FFFFFF" },
      outline: { color: "#3B82F6" },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  if (variant === "outline") {
    return (
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Text style={getTextStyle()}>{loading ? "Yükleniyor..." : title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors() as any}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Text style={getTextStyle()}>{loading ? "Yükleniyor..." : title}</Text>
    </TouchableOpacity>
  );
};
