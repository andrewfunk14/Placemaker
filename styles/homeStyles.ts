// styles/homeStyles.ts
import { Platform, StyleSheet } from "react-native";

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
  translucentLight: "rgba(255,255,255,0.06)",
  translucentBorder: "rgba(255,255,255,0.12)",
  badgeBg: "rgba(255,210,31,0.15)",
  modalBackdrop: "rgba(0,0,0,0.6)",
};

const webPad = Platform.select({ web: 24, default: 16 }) as number;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMid, 
    paddingTop: Platform.OS === "web" ? 12 : 8,
  },
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
  content: {
    flex: 1,
  },
  listPad: {
    paddingHorizontal: webPad,
    // paddingVertical: 12,
    gap: 12,
    paddingBottom: 100,
  },

  // CARD STYLES
  card: {
    backgroundColor: "rgba(12, 10, 10, 0.04)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.badgeBg,
    color: colors.accent,
    fontSize: Platform.OS === "web" ? 22 : 24,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editTopRightButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    elevation: 10,
    borderRadius: 9999,
    backgroundColor: colors.translucentLight,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    padding: 12,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  creatorTopRightWrap: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  creatorTopRightAvatar: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    backgroundColor: colors.translucentLight,
  },
  creatorTopRightFallback: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  creatorAvatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  deleteCircle: {
    marginLeft: Platform.OS === "web" ? 12 : 8,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },  
  cardTitle: {
    color: colors.textPrimary,
    fontSize: Platform.OS === "web" ? 30 : 28,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: 22,
  },
  cardDot: { 
    color: colors.textSecondary, 
    fontSize: 20,
  },
  cardDesc: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 20,
    opacity: 0.95,
    marginTop: 8,
  },

  // EMPTY STATE
  empty: {
    color: colors.textPrimary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 16,
    fontSize: 24,
  },

  // FAB BUTTON
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
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPlus: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000",
  },

  // MODAL STYLES
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.modalBackdrop,
  },
  modalCardWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 300,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  modalBody: {
    color: colors.textMuted,
    fontSize: 20,
    marginTop: 8,
    textAlign: "center",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "center",
    textAlign: "center",
    marginTop: 16,
  },
  modalBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
  },
  modalBtnText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "600",
  },
  modalBtnGhost: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  modalBtnGhostText: { 
    color: colors.accent 
  },
  modalBtnDanger: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.danger,
  },
  modalBtnDangerText: { 
    color: colors.danger 
  },
  
  // EVENT MODAL
  modalRoot: { 
    flex: 1, 
    justifyContent: "center" 
  },
  backdrop: { 
    ...StyleSheet.absoluteFillObject, 
    zIndex: 1 
  },
  eventModalCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.border,
  },
  eventModalCardWrap: { 
    flex: 1, 
    justifyContent: "center", 
    paddingHorizontal: 16, 
    zIndex: 2 
  },
  modalTitleText: {
    color: colors.accent,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundMid,
    color: "#ffffff",
    marginBottom: 12,
    fontSize: 18,
  },
  textarea: {
    height: 110,
    paddingTop: 12,
  },
  inputText: { 
    color: colors.placeholderText, 
    fontSize: 18, 
  },
  center: { 
    justifyContent: "center", 
  },
  row: { 
    flexDirection: "row", 
    gap: 16, 
    justifyContent: "center" 
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnText: { 
    color: "#000", 
    fontSize: 20, 
    fontWeight: "600",
    textAlign: "center", 
  },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  btnGhostText: { 
    color: colors.accent,
    fontSize: 20, 
    fontWeight: "600",
    textAlign: "center",  
  },
  iosSheet: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
    marginBottom: 12,
    overflow: "hidden",
    zIndex: 2,
  },
  iosSheetBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  sheetBtnText: { 
    color: colors.textSecondary, 
    fontSize: 18, 
    fontWeight: "600" 
  },
  iosPicker: {
    alignSelf: "stretch",
    backgroundColor: colors.backgroundDark,
    ...Platform.select({
      ios: { height: 320 },
      android: { height: 0 },
    }),
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: "center" as const,
    fontSize: 22,
    fontWeight: 600,
  },
});
