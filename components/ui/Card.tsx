import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "gradient";
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  style,
}) => {
  const cardStyle = [
    styles.card,
    variant === "gradient" && styles.gradientCard,
    style,
  ];

  if (variant === "gradient") {
    return (
      <View style={cardStyle}>
        <LinearGradient
          colors={["rgba(59, 130, 246, 0.1)", "rgba(16, 185, 129, 0.1)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {children}
      </View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
});
