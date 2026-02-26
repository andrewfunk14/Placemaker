// styles/homeStyles.ts
import { StyleSheet, Platform } from "react-native";
import { colors, webPad, globalStyles as g } from "./globalStyles";

export { colors };

const uniqueStyles = StyleSheet.create({
  // home.tsx
  content: {
    flex: 1,
  },
  listPad: {
    paddingHorizontal: webPad,
    gap: 12,
    paddingBottom: 100,
  },

  // CARD STYLES
  card: {
    backgroundColor: "rgba(12, 10, 10, 0.04)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.translucentBorder,
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
    backgroundColor: colors.accent,
    padding: 12,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  creatorTopRightWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    pointerEvents: "box-none",
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
    marginBottom: 4,
  },
  cardMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8,
  },
  cardDate: {
    color: colors.accent,
    fontSize: 22,
  },
  cardTime: {
    color: colors.accent,
    fontSize: 22,
  },
  cardDot: {
    color: colors.accent,
    fontSize: 20,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: 22,
  },
  cardDesc: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 20,
    opacity: 0.95,
    marginTop: 8,
  },

  // MODAL STYLES (delete confirm)
  modalCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 300,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.accent,
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
    color: colors.accent,
  },
  modalBtnDanger: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.danger,
  },
  modalBtnDangerText: {
    color: colors.danger,
  },

  // EVENT MODAL
  modalRoot: {
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  eventModalCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  eventModalCardWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    zIndex: 2,
  },
  eventModalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
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
    color: "#f5f5f5",
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
    justifyContent: "center",
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
    fontWeight: "600",
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
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
});

export const styles = { ...g, ...uniqueStyles };
