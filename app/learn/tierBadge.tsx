// learn/tierBadge.tsx
import React from "react";
import { View, Text } from "react-native";

interface TierBadgeProps {
  tier?: string | null;
}

const TIER_COLORS = {
  free: "#9CA3AF",
  paid: "#FBBF24",
};

export default function TierBadge({ tier }: TierBadgeProps) {
  const normalized = tier?.toLowerCase().trim() || null;
  if (!normalized || (normalized !== "free" && normalized !== "paid")) {
    return null; 
  }

  const color = TIER_COLORS[normalized as "free" | "paid"];
  const label = normalized === "paid" ? "Placemaker" : "Free";

  return (
    <View
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 10,
        alignSelf: "flex-start",
        marginTop: 2,
        marginBottom: 2,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: 0.3,
          textTransform: "capitalize",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
