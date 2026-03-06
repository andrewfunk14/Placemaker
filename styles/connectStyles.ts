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
    marginBottom: 16,
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
    color: colors.backgroundDark,
    fontSize: 18,
    fontWeight: "900",
    marginTop: -1,
  },
  topHeader: {
    color: colors.textPrimary,
    fontSize: 28,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: Platform.OS === "web" ? 16 : 12,
    marginLeft: 4,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 28,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: Platform.OS === "web" ? 16 : 12,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.translucentLight,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
  },
  matchName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 2,
  },
  matchTier: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: 0.5,
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
    maxWidth: 320,
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
    marginTop: 4,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.backgroundDark,
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
    marginBottom: 8,
  },
  dayHeaderText: {
    marginHorizontal: 12,
    color: "#ccc",
    fontSize: 15,
    fontWeight: "600",
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.translucentLight,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  messageContentBlock: {
    flexShrink: 1,
    paddingLeft: 12,
  },
  messageSender: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  slackMessageText: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 24,
  },
  messageTimestamp: {
    color: colors.placeholderText,
    fontSize: 13,
    alignSelf: 'center',
  },
  messageInputRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: Platform.OS === "web" ? 40 : 28,
    paddingHorizontal: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.translucentLight,
    color: colors.textPrimary,
    fontSize: 16,
    padding: 4,
    borderRadius: 8,
  },
  sendButton: {
    marginLeft: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: colors.placeholderText,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
});

export const connectStyles = { ...g, ...uniqueStyles };
