// styles/globalStyles.ts
import { StyleSheet, Platform } from "react-native";

export const colors = {
  backgroundDark: "#0d0d0d",
  backgroundMid: "#1a1a1a",
  border: "#ffd21f",
  textPrimary: "#ffffff",
  textSecondary: "#ccc",
  textMuted: "#cfcfcf",
  placeholderText: "#a0a0a0",
  accent: "#ffd21f",
  danger: "#ff4d4f",
  success: "#4CAF50",
  link: "#2e78b7",
  translucentLight: "rgba(255,255,255,0.06)",
  translucentBorder: "rgba(255,255,255,0.12)",
  badgeBg: "rgba(255,210,31,0.15)",
  modalBackdrop: "rgba(0,0,0,0.6)",
};

const webPad = Platform.select({ web: 24, default: 16 }) as number;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMid, 
    paddingTop: Platform.OS === "web" ? 12 : 8,
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundMid,
    color: "#ffffff",
    marginBottom: Platform.OS === "web" ? 16 : 12,
    fontSize: 18,
  },
});
