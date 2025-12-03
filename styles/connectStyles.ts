// styles/connectStyles.ts
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

const horizontalPad = Platform.select({ web: 20, default: 12 }) as number;

export const connectStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMid,
    paddingHorizontal: horizontalPad,
    paddingTop: Platform.OS === "web" ? 12 : 8,
    paddingBottom: 8,
  },

  // TOP BAR (groups + create) ----------------------------------
  topBar: {
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    marginBottom: 10,
  },
  topBarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  topBarTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  topBarCreateButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  topBarCreateButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
  },

  groupChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  groupChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.translucentLight,
    marginRight: 8,
  },
  groupChipSelected: {
    backgroundColor: colors.accent,
  },
  groupChipText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },

  // MATCHMAKING CARD -------------------------------------------
  matchmakingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.translucentLight,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
  },
  matchmakingTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  matchmakingTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  matchmakingSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  matchmakingButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  matchmakingButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },

  // CHAT AREA ---------------------------------------------------
  chatPane: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    overflow: "hidden",
  },
  chatPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 16,
  },

  // createGroupModal.tsx ---------------------------------------
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  
  // Shared text input style
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundMid,
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 12,
    fontSize: 18,
  },
    dropdownContainer: {
    width: "100%",
  },
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    backgroundColor: colors.backgroundMid,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dropdownValue: {
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: colors.placeholderText,
  },
  dropdownArrow: {
    fontSize: 18,
    color: colors.placeholderText,
    marginLeft: 8,
  },
  dropdownPanel: {
    width: "100%",
    borderWidth: 1,
    backgroundColor: colors.backgroundMid,
    maxHeight: 220,
    overflow: "hidden",
  },
  dropdownList: {
    flex: 1,
  },
  emptyDropdownText: {
    color: colors.danger,
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  userRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,   
  },
  dropdownItemSelected: {
    backgroundColor: colors.translucentLight,
  },
  dropdownItemTextSelected: {
    color: colors.accent,
    fontWeight: "600",
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },  
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  buttonGhostText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "600",
  },
// Full-screen groups list
  groupsListScroll: {
    flex: 1,
    marginTop: 10,
  },
  groupsListContent: {
    paddingBottom: 80,
  },
  
  // Group "card"
  groupCard: {
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: 12,
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  
  groupCardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  groupCardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  
  groupCardChat: {
    borderTopWidth: 1,
    borderTopColor: colors.translucentBorder,
    padding: 8,
  },
  addMemberButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.accent,
    borderRadius: 6,
    alignSelf: "flex-start",
    // marginBottom: 8,
  },
  addMemberButtonText: {
    color: "white",
    fontWeight: "600",
  },  
  
  // Floating Action Button
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
  headerMainTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  headerSmallFab: {
    backgroundColor: colors.accent,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  headerSmallFabText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
    marginTop: -1,
  },  
  // groupChat.tsx ----------------------------------------------
  dayHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    // marginVertical: 20,
  },
  
  dayHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  
  dayHeaderText: {
    marginHorizontal: 12,
    color: "#ccc",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  slackMessageBlock: {
    marginBottom: 12,
  },
  slackMessageBox: {
    borderWidth: 1,
    borderColor: "#2b2b2b",
    backgroundColor: "#111",    
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },  
  slackHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  slackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },

  slackAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  slackSenderName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  slackHeaderTextBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  slackTimestamp: {
    color: "#888",
    fontSize: 12,
    marginLeft: 6,
  },

  slackMessageTextBlock: {
    marginTop: 2,
    paddingRight: 40,
  },

  slackMessageText: {
    color: "#ddd",
    fontSize: 15,
    lineHeight: 20,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    // paddingRight: 50, // so long bubbles don't overlap
  },
  
  // Push your own messages to the right
  messageRowSelf: {
    justifyContent: "flex-end",
  },

  avatarWrapper: {
    marginRight: 12,
    marginTop: 6, // 🔥 pulls avatar DOWN to align with the bubble
  },
  
  messageAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#333",
  },
  
  messageAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  
  fallbackText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  
  messageContentBlock: {
    flexShrink: 1,
    paddingTop: 4, // 🔥 aligns text with avatar center
  },  
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messagesList: {
    flex: 1,
  },
  messageWrapper: {
    marginBottom: 10,
  },
  messageText: {
    color: colors.textPrimary,
  },
  messageSelfText: {
    color: "#000",
  },
  messageLeftSide: {
    marginRight: 8,
  },
  messageSender: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 3,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  
  messageOther: {
    backgroundColor: "#333",
    alignSelf: "flex-start",
  },
  
  messageSelf: {
    backgroundColor: "#f5d142",
    alignSelf: "flex-end",
  },
  
  messageTimestamp: {
    color: "#888",
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  
  messageTimestampSelf: {
    alignSelf: "flex-end",
  },  
  messageInputRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.translucentLight,
    color: colors.textPrimary,
    padding: 10,
    borderRadius: 8,
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#000",
    fontWeight: "700",
  },
});
