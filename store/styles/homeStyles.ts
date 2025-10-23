// styles/homeStyles.ts
import { Platform, StyleSheet } from "react-native";

const colors = {
  backgroundDark: "#0d0d0d",
  backgroundMid: "#1a1a1a",
  border: "#ffd21f",
  textPrimary: "#ffffff",
  textSecondary: "#ccc",
  textMuted: "#cfcfcf",
  accent: "#ffd21f",
  danger: "#ff4d4f",
  translucentLight: "rgba(255,255,255,0.06)",
  translucentBorder: "rgba(255,255,255,0.12)",
  badgeBg: "rgba(255,210,31,0.15)",
  modalBackdrop: "rgba(0,0,0,0.6)",
};

const webPad = Platform.select({ web: 24, default: 16 }) as number;

export const styles = StyleSheet.create({
  // ROOT & CONTAINERS
  root: {
    flex: 1,
    backgroundColor: colors.backgroundMid, 
  },
  searchRow: {
    paddingHorizontal: webPad,
    paddingTop: 12,
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
    paddingVertical: 16,
    gap: 12,
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
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  actionsTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.translucentLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.translucentBorder,
  },
  actionsTopGhost: { 
    opacity: 0 
  },
  iconBtn: { 
    padding: 2 
  },
  iconEdit: { 
    color: colors.accent 
  },
  iconDelete: { 
    color: colors.danger 
  },
  iconHidden: { 
    opacity: 0 
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: Platform.OS === "web" ? 0 : 4,
  },
  cardMetaRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginTop: 8,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: 18,
    flexShrink: 1,
  },
  cardDot: { 
    color: colors.textSecondary 
  },
  cardDesc: {
    marginTop: 8,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.95,
  },

  // EMPTY STATE
  empty: {
    color: colors.textPrimary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 24,
    fontSize: 24,
  },

  // FAB BUTTON
  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPlus: {
    fontSize: 28,
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
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  modalBody: {
    color: colors.textMuted,
    fontSize: 18,
    marginTop: 8,
    textAlign: "center",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "center",
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
    fontSize: 18,
    fontWeight: "800",
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
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundMid,
    color: "#a0a0a0",
    marginBottom: 12,
    fontSize: 16,
  },
  textarea: {
    height: 110,
    paddingTop: 12,
  },
  inputText: { 
    color: "#a0a0a0", 
    fontSize: 16 
  },
  center: { 
    justifyContent: "center", 
  },
  row: { 
    flexDirection: "row", 
    gap: 12, 
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
    fontWeight: "700" 
  },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  btnGhostText: { 
    color: colors.accent 
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
    fontWeight: "700" 
  },
  iosPicker: {
    alignSelf: "stretch",
    backgroundColor: colors.backgroundDark,
    ...Platform.select({
      ios: { height: 320 },
      android: { height: 0 },
    }),
  },
});
