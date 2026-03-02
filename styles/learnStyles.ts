// styles/learnStyles.ts
import { StyleSheet, Platform } from "react-native";
import { colors, webPad, globalStyles as g } from "./globalStyles";

export { colors };

const uniqueStyles = StyleSheet.create({
  // learn.tsx
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagScroll: {
    marginTop: 8,
    minHeight: 32,
  },
  tagPill: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  tagText: {
    color: colors.textPrimary,
    fontWeight: "500",
    fontSize: 14,
  },
  content: {
    paddingBottom: 100,
    paddingHorizontal: webPad,
  },

  // resourceCard.tsx
  cardContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.translucentBorder,
    padding: 12,
    marginBottom: 12,
  },
  cardDimmed: {
    opacity: 0.5,
  },
  cardTitle: {
    fontSize: Platform.OS === "web" ? 30 : 24,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  reviewStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
    marginBottom: 2,
  },
  reviewPending: {
    backgroundColor: "rgba(255,210,31,0.15)",
  },
  reviewApproved: {
    backgroundColor: "#2f5f2f",
  },
  reviewStatusText: {
    fontSize: 18,
    fontWeight: "500",
  },
  reviewPendingText: {
    color: colors.accent,
  },
  reviewApprovedText: {
    color: "#9ae66e",
  },
  cardDescription: {
    color: colors.textPrimary,
    fontSize: Platform.OS === "web" ? 18 : 16,
    lineHeight: 20,
    opacity: 0.95,
    marginTop: 6,
    marginBottom: 4,
  },
  cardFileItem: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    padding: 4,
    marginTop: 4,
  },
  cardFileImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: colors.backgroundMid,
  },
  cardFileText: {
    color: colors.link,
    flexShrink: 1,
    fontSize: 16,
  },
  cardTagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTagPill: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardTagText: {
    color: colors.textPrimary,
    fontSize: 16,
  },

  // uploadModal.tsx & adminModal.tsx
  error: {
    color: colors.danger,
    marginBottom: 16,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
  adminPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundMid,
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "gray",
  },
  filePreviewIcon: {
    marginRight: 8,
  },

  // tagDropdown.tsx
  dropdownContainer: {
    width: "100%",
    marginBottom: Platform.OS === "web" ? 16 : 12,
  },
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    backgroundColor: colors.backgroundMid,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: colors.placeholderText,
  },
  dropdownModal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownList: {
    width: "80%",
    maxWidth: 300,
    backgroundColor: colors.backgroundMid,
    borderRadius: 16,
    borderWidth: 1,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.translucentBorder,
  },
  dropdownItemSelected: {
    backgroundColor: colors.translucentLight,
  },
  dropdownItemText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: colors.accent,
    fontWeight: "600",
  },
});

export const learnStyles = { ...g, ...uniqueStyles };
