// store/styles/learnStyles.ts
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

export const learnStyles = StyleSheet.create({
// learn.tsx
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMid, 
    paddingTop: Platform.OS === "web" ? 16 : 12,
  },
  searchRow: {
    paddingHorizontal: webPad,
    // marginBottom: 12,
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
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagScroll: {
    marginTop: 6,
    marginBottom: 8,
    minHeight: 36,
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
  tagPillActive: {
    backgroundColor: colors.accent,
    borderWidth: 0,
  },
  tagText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  tagTextActive: {
    color: "#000",
  },
  content: {
    flex: 1,
    paddingBottom: 100,
    paddingHorizontal: webPad,
  },
  fab: {
    position: "absolute",
    bottom: 18,
    right: 18,
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
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

// resourceList.tsx
  empty: {
    color: colors.textPrimary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 16,
    fontSize: 24,
  },

// resourceCard.tsx
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: 12,
    marginBottom: 12,
  },
  cardDimmed: {
    opacity: 0.5,
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: Platform.OS === "web" ? 30 : 24,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  deleteCircle: {
    marginLeft: Platform.OS === "web" ? 12 : 8,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
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
    fontSize: Platform.OS === "web" ? 18 : 15,
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
    backgroundColor: "#f0f0f0",
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

  // deleteConfirmModal.tsx
  confirmModalCard: {
    backgroundColor: colors.backgroundMid,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    width: "80%",
    maxWidth: 380,
    alignSelf: "center",
    top: "40%",
  },
  confirmTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  confirmSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
  },
  confirmButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },  

// uploadModal.tsx & adminModal.tsx
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
  inputMultiline: {
    height: 110,
    paddingTop: 12,
  },
  error: {
    color: colors.danger,
    marginBottom: 16,
    textAlign: "center" as const,
    fontSize: 22,
    fontWeight: 600,
  },
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
  buttonText: { 
    color: "#000", 
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

// fileUpload.tsx
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundMid,
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "gray",
  },
  modalPreviewImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 6,
  },
  filePreviewIcon: {
    marginRight: 8,
  },
  filePreviewName: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    marginRight: 6,
    maxWidth: 120,
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
    color: "#ffffff",
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
    // minHeight: 485,
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
  dropdownDoneButton: {
    paddingVertical: 10,
    alignItems: "center",
    borderTopColor: colors.translucentBorder,
  },
  dropdownDoneText: {
    color: colors.accent,
    fontWeight: "600",
    fontSize: 20,
    marginBottom: 6,
  },
});
