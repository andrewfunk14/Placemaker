// styles/buildStyles.ts
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

  export const buildStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundMid, 
      paddingTop: Platform.OS === "web" ? 12 : 8,
    },
    scrollContent: {
      paddingBottom: 80,
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
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 13,
      color: colors.textMuted,
    },
  
    listHeader: {
      marginTop: 4,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
  
    emptyText: {
      marginTop: 12,
      textAlign: 'center',
      fontSize: 20,
      color: colors.textMuted,
    },
  
    // Feed cards
    projectCard: {
      backgroundColor: colors.backgroundMid,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.translucentBorder,
    },
    projectHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    projectTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    projectLocation: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    projectDescription: {
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    projectMeta: {
      fontSize: 11,
      color: colors.textMuted,
    },
  
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.badgeBg,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "capitalize",
      color: colors.textPrimary,
    },
  
    // FAB
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
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalBackdrop,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    modalCard: {
      backgroundColor: colors.backgroundMid,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.translucentBorder,
      overflow: "hidden",
      maxHeight: "90%",
    },
    modalScrollContent: {
      padding: 16,
      paddingBottom: 24,
    },
  
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    lockedText: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 10,
    },
    disabledSection: {
      opacity: 0.45,
    },
  
    input: {
      borderWidth: 1,
      borderColor: colors.translucentBorder,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === "web" ? 10 : 12,
      marginBottom: 12,
      fontSize: 14,
      color: colors.textPrimary,
      backgroundColor: colors.backgroundDark,
    },
    textarea: {
      minHeight: 120,
      textAlignVertical: "top",
    },
  
    // little helper for accessing placeholder color in component
    placeholderColor: {
      color: colors.placeholderText,
    },
  
    label: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textSecondary,
      marginBottom: 6,
    },
    statusRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    statusOption: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.translucentBorder,
      borderRadius: 999,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundDark,
    },
    statusOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.translucentLight,
    },
    statusOptionText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statusOptionTextSelected: {
      color: colors.textPrimary,
      fontWeight: "600",
    },
  
    button: {
      marginTop: 8,
      borderRadius: 999,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: colors.accent,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.backgroundDark,
      fontWeight: "700",
      fontSize: 15,
    },
  
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginTop: 8,
    },
  
    modalFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.translucentBorder,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      justifyContent: "flex-end",
      backgroundColor: colors.backgroundDark,
    },
    modalCloseText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "500",
    },
});
