// styles/authStyles.ts
import { Platform, StyleSheet } from "react-native";

const colors = {
  bg: "#0d0d0d",
  brand: "#ffd21f",
  text: "#ffffff",
  textMuted: "#a0a0a0",
  border: "#ffd21f",
  inputBg: "#1c1c1c",
  link: "#2e78b7",
  danger: "#ff4d4f",
  success: "#4ade80",
};

export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    cursor: "auto" as any,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderColor: colors.border,
    borderWidth: 2,
    elevation: 5,
  },
  wordmarkContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  wordmark: {
    width: 250,
    height: 40,
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    color: "#e5e5e5",
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  primaryBtnText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 24,
  },
  ghostBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  forgotLinkBtn: {
    alignSelf: "center",
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "transparent",
    marginTop: 4,
    marginBottom: 16,
  },
  linkBtn: {
    alignSelf: "center",
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  link: {
    color: colors.link,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center" as const,
  },
  helperText: {
    fontSize: 24,
    color: colors.text,
    textAlign: "center" as const,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    marginTop: 4,
    textAlign: "center" as const,
    fontSize: 24,
  },
  success: {
    color: colors.success,
    marginTop: 4,
    textAlign: "center" as const,
    fontSize: 24,
  },
  footerRow: {
    marginTop: 8,
    alignItems: "center",
  },
  pageContainer: {
    flex: 1,
    backgroundColor: "transparent",
    ...(Platform.OS === "web" ? { cursor: "auto" as any } : null),
  },
});
