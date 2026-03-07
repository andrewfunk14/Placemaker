// styles/globalStyles.ts
import { StyleSheet, Platform } from "react-native";
import { cardShadow } from "./shadow";

export const colors = {
  backgroundDark: "#0d0d0d",
  backgroundMid: "#1a1a1a",
  authInputBg: "#222222",
  border: "#ffd21f",
  textPrimary: "#f5f5f5",
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

export const webPad = Platform.select({ web: 24, default: 16 }) as number;

export const globalStyles = StyleSheet.create({
  // ─── Screen container ───────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMid,
    paddingTop: Platform.OS === "web" ? 12 : 8,  
  },

  // ─── Search bar ─────────────────────────────────────────────────────
  searchRow: {
    paddingHorizontal: webPad,
    marginBottom: 12,
  },
  search: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    backgroundColor: colors.translucentLight,
    color: colors.textPrimary,
    fontSize: 16,
  },

  // ─── Inputs ─────────────────────────────────────────────────────────
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundMid,
    color: colors.textPrimary,
    marginBottom: 16,
    fontSize: 18,
  },
  inputMultiline: {
    height: 110,
    paddingTop: 12,
  },

  // ─── Empty state ─────────────────────────────────────────────────────
  empty: {
    color: colors.textPrimary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 16,
    fontSize: 24,
  },

  // ─── FAB ─────────────────────────────────────────────────────────────
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    ...cardShadow,
  },
  fabPlus: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.backgroundDark,
  },

  // ─── Modal structure ─────────────────────────────────────────────────
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.modalBackdrop,
  },
  modalCardWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.accent,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 12,
  },

  // ─── Buttons ─────────────────────────────────────────────────────────
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 4,
    marginTop: 16,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.backgroundDark,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  buttonGhostText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },

  // ─── File upload (build + learn) ─────────────────────────────────────
  fileUploadButton: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  uploadFileButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadFileText: {
    color: colors.link,
    fontSize: 26,
    fontWeight: "500",
  },
  filePreviewCard: {
    width: 160,
    marginRight: 10,
    marginTop: 12,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.backgroundMid,
    borderWidth: 1,
    borderColor: "gray",
  },
  modalPreviewImage: {
    width: 160,
    height: 160,
  },
  filePreviewName: {
    color: colors.textPrimary,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filePreviewRemove: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#0d0d0d",
  },
  filePreviewIconBox: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundDark,
  },

  // ─── Uniform card header (avatar left + ellipsis right) ──────────────
  cardAvatarLeft: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.translucentLight,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEllipsisButton: {
    padding: 4,
    borderRadius: 999,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  cardActionMenu: {
    position: "absolute",
    top: 48,
    right: 8,
    zIndex: 200,
    elevation: 200,
    backgroundColor: colors.backgroundDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    minWidth: 130,
    overflow: "hidden",
  },
  cardActionMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardActionMenuText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "500",
  },
  cardActionMenuDangerText: {
    color: colors.danger,
  },
  cardActionMenuDivider: {
    height: 1,
    backgroundColor: colors.translucentBorder,
  },
});
