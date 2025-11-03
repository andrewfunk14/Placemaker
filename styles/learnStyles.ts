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
    paddingTop: Platform.OS === "web" ? 20 : 16,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
    paddingHorizontal: webPad,
  },
  // === SEARCH BAR ===
  searchRow: {
    paddingHorizontal: webPad,
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
  // === TAG FILTERS ===
  tagScroll: {
    marginTop: 6,
    marginBottom: 8,
    minHeight: 36,
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  // === EMPTY TEXT ===
  empty: {
    color: colors.textPrimary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 16,
    fontSize: 24,
  },
  // === FLOATING ACTION BUTTON ===
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  fabPlus: {
    color: "#000",
    fontSize: 34,
    fontWeight: "600",
    lineHeight: 38,
  },

// === resourceCard.tsx ===
  cardContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: Platform.OS === "web" ? 16 : 12,
    marginBottom: 12,
  },
  cardDimmed: {
    opacity: 0.5,
  },
  // === Top-right avatar/edit layout ===
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
  creatorTopRightInitials: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffd21f",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 8,
  },
  cardTitle: {
    fontSize: Platform.OS === "web" ? 28 : 26,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: 16,
    // lineHeight: 20,
    // marginBottom: 10,
  },
  deleteCircle: {
    marginLeft: Platform.OS === "web" ? 12 : 8,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  // === File link ===
  fileLinkWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  fileLinkText: {
    color: "#4D9EFF",
    fontWeight: "600",
    fontSize: 18,
  },
  // === Tags (pill style like top filters) ===
  cardTagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardTagPill: {
    backgroundColor: colors.translucentLight,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
  },
  cardTagText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  // === Delete Confirmation Modal ===
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

// === uploadModal.tsx ===
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
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalTitle: {
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
    marginBottom: 16,
    fontSize: 18,
  },
  inputMultiline: {
    height: 110,
    paddingTop: 12,
  },
  fileButton: {
    backgroundColor: colors.translucentLight,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  fileButtonText: {
    color: colors.link,
    fontSize: 18,
    fontWeight: "500",
  },
  fileButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fileIcon: {
    marginRight: 6,
  },  
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
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
// === resourceModal.tsx ===
  filePreviewContainer: {
    marginTop: 10,
    marginBottom: 12,
  },
  filePreviewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    marginBottom: 6,
  },
  // === Dropdown.tsx ===
  dropdownContainer: {
    width: "100%",
    marginBottom: 16,
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
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
  dropdownItemLast: {
    borderBottomWidth: 0,
  },

});
