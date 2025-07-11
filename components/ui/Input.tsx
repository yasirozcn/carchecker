import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: "default" | "outlined";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = "default",
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          variant === "outlined" && styles.outlinedInput,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          style,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  outlinedInput: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  focusedInput: {
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
  },
});
