// styles/buildStyles.ts
import { StyleSheet } from "react-native";
import { colors, globalStyles as g } from "./globalStyles";

export { colors };

const uniqueStyles = StyleSheet.create({
  // build.tsx
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.translucentLight,
    borderWidth: 1,
    borderColor: colors.translucentBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  projectAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: "cover",
  },
  projectHeaderText: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  projectLocation: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.accent,
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
    fontSize: 15,
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
  },
  projectMediaImage: {
    width: "100%",
    height: "100%",
  },
  projectCaption: {
    marginTop: 8,
    paddingHorizontal: 4,
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // postProjectModal.tsx
  modalStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
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
  statusOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export const buildStyles = { ...g, ...uniqueStyles };
