// styles/connectStyles.ts
import { StyleSheet, Platform } from "react-native";
import { colors, webPad, globalStyles as g } from "./globalStyles";

export { colors };

const uniqueStyles = StyleSheet.create({
  // connect.tsx
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMid,
    paddingHorizontal: webPad,
    paddingTop: Platform.OS === "web" ? 12 : 8,
    paddingBottom: 8,
  },
  groupsListScroll: {
    flex: 1,
  },
  groupCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  groupCardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupCardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
  },
  headerSmallFab: {
    backgroundColor: colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  headerSmallFabText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "900",
    marginTop: -1,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 28,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 12,
    marginLeft: 4,
  },
  matchCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.translucentBorder,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  matchLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  matchMessageButton: {
    padding: 12,
    marginLeft: 12,
  },
  matchMessageIcon: {
    color: colors.accent,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  matchAvatarInitial: {
    color: "#f5f5f5",
    fontSize: 24,
    fontWeight: "700",
  },
  matchName: {
    color: "#f5f5f5",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 2,
  },
  matchTier: {
    color: "#FFD21F",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  matchSubtitle: {
    color: "#bbb",
    fontSize: 16,
  },

  // createGroupModal.tsx
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    alignSelf: "center",
    position: "relative",
    zIndex: 1,
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
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundMid,
    color: "#f5f5f5",
    marginTop: 16,
    marginBottom: 12,
    fontSize: 18,
  },
  dropdownContainer: {
    position: "relative",
    width: "100%",
    zIndex: 2000,
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
  dropdownPanel: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundMid,
    maxHeight: 220,
    borderRadius: 6,
    zIndex: 9999,
    elevation: 20,
    overflow: "hidden",
    pointerEvents: "box-none",
  },
  dropdownList: {
    flex: 1,
  },
  userRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
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
  buttonGhostText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "600",
  },

  // groupChat.tsx & directMessageChat.tsx
  messagesList: {
    flex: 1,
  },
  dayHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  avatarWrapper: {
    marginRight: 12,
    marginTop: 6,
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
    color: "#f5f5f5",
    fontWeight: "600",
    fontSize: 16,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
    color: "#f5f5f5",
  },
  myMessageTimestamp: {
    color: "#ddd",
    alignSelf: "flex-end",
  },
  theirMessageTimestamp: {
    color: "#ddd",
    alignSelf: "flex-start",
  },
  messageContentBlock: {
    flexShrink: 1,
    paddingTop: 4,
  },
  messageSender: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  slackMessageText: {
    color: "#ddd",
    fontSize: 16,
    lineHeight: 24,
  },
  messageTimestamp: {
    color: colors.placeholderText,
    fontSize: 13,
    marginTop: 8,
    alignSelf: 'center',
  },
  messageInputRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: Platform.OS === "ios" ? 28 : 20,
    paddingHorizontal: 16,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.translucentLight,
    color: colors.textPrimary,
    padding: 12,
    borderRadius: 8,
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.accent,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});

export const connectStyles = { ...g, ...uniqueStyles };
