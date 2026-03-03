// profile/roleBadge.tsx
import React from "react";
import { View, Text, Platform } from "react-native";
import { profileStyles as styles } from "../../styles/profileStyles";

export type TierRole =
  | "placemaker"
  | "policymaker"
  | "dealmaker"
  | "changemaker"
  | "admin"
  | "free";

export const ROLE_COLORS: Record<TierRole, string> = {
  placemaker: "#FBBF24",
  policymaker: "#3B82F6",
  dealmaker: "#22C55E",
  changemaker: "#F97316",
  admin: "#9CA3AF",
  free: "#9CA3AF",
};

interface RoleBadgeProps {
  role: TierRole;
  label?: string;
}

export default function RoleBadge({ role, label }: RoleBadgeProps) {
  const color = ROLE_COLORS[role] || ROLE_COLORS.free;

  return (
    <View
      style={[
        styles.roleBadge,
        {
          backgroundColor: `${color}20`,
          borderColor: `${color}55`,
        },
      ]}
    >
      <Text
        style={[
          styles.roleBadgeText,
          {
            color,
            fontFamily:
              Platform.OS === "web"
                ? "Poppins, sans-serif"
                : "Poppins_600SemiBold",
          },
        ]}
      >
        {label ?? role}
      </Text>
    </View>
  );
}
