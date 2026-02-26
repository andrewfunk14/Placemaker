// styles/buildStyles.ts
import { StyleSheet } from "react-native";
import { colors, globalStyles as g } from "./globalStyles";

export { colors };

const uniqueStyles = StyleSheet.create({
  // build.tsx
  webGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  gridItem1: {
    flexBasis: "100%",
    maxWidth: "100%",
    paddingHorizontal: 8,
  },
  gridItem2: {
    flexBasis: "50%",
    maxWidth: "50%",
    paddingHorizontal: 8,
  },
  gridItem3: {
    flexBasis: "33.3333%",
    maxWidth: "33.3333%",
    paddingHorizontal: 8,
  },
  mobileList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 0,
  },

  // projectCard.tsx
  projectCard: {
    borderRadius: 16,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.translucentBorder,
    width: "100%",
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  projectHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  projectAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  projectAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  projectAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center",
  },
  projectAvatarInitial: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  projectHeaderText: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  statusRow: {
    flexDirection: "row",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.badgeBg,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "capitalize",
    color: colors.textPrimary,
  },
  dot: {
    fontWeight: "700",
    fontSize: 18,
    marginHorizontal: 4,
    color: colors.textSecondary,
  },
  projectMetaInline: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  projectMedia: {
    marginTop: 10,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    backgroundColor: colors.backgroundDark,
    aspectRatio: 4 / 5,
  },
  projectMediaImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  projectCaption: {
    marginTop: 8,
    paddingHorizontal: 4,
    fontSize: 16,
    color: colors.textPrimary,
  },

  // postProjectModal.tsx
  modalStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  statusOption: {
    flex: 1,
    borderWidth: 2,
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusOptionTextSelected: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});

export const buildStyles = { ...g, ...uniqueStyles };
