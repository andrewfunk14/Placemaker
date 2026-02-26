// styles/authStyles.ts
import { Platform, StyleSheet } from "react-native";
import { colors as gc } from "./globalStyles";

const colors = {
  bg: gc.backgroundDark,
  brand: gc.accent,
  text: gc.textPrimary,
  placeholderText: gc.placeholderText,
  border: gc.border,
  inputBg: gc.authInputBg,
  link: gc.link,
  danger: gc.danger,
  success: gc.success
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
    color: colors.text,
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
    fontSize: Platform.OS === "web" ? 24 : 22,
    textTransform: "uppercase",
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  forgotLinkBtn: {
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  link: {
    color: colors.link,
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center" as const,
  },
  helperText: {
    fontSize: 28,
    color: colors.text,
    textAlign: "center" as const,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    marginTop: 4,
    textAlign: "center" as const,
    fontSize: 26,
    fontWeight: 600,
  },
  success: {
    color: colors.success,
    marginTop: 4,
    textAlign: "center" as const,
    fontSize: 26,
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
