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
    fontSize: 24,
    fontWeight: "600",
    paddingVertical: Platform.OS === "web" ? 12 : 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: Platform.OS === "web" ? 30 : 28,
    fontWeight: "600",
    marginBottom: 4,
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
    lineHeight: 28,
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
    color: colors.textPrimary,
    marginBottom: 16,
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
    color: colors.backgroundDark,
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
  error: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
});

export const styles = { ...g, ...uniqueStyles };
