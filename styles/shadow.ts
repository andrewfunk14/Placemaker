// styles/shadow.ts
import { Platform, ViewStyle } from "react-native";

export function cardShadow(): ViewStyle {
  if (Platform.OS === "web") {
    // Only web-friendly shadow here
    return { boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
  }
  // iOS/Android shadow
  return {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  };
}
