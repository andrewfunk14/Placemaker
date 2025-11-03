// learn/resourceCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
} from "react-native";
import type { Resource } from "../../store/slices/resourcesSlice";
import { useAppDispatch } from "../../store/hooks";
import {
  deleteResource,
  fetchResources,
} from "../../store/slices/resourcesSlice";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import ResourceModal from "./resourceModal";
import { Pencil, User2, MinusCircle, FileText } from "lucide-react-native";
import DeleteConfirmModal from "./deleteConfirmModal";

interface ResourceCardProps {
  resource: Resource;
  user: {
    id?: string;
    roles?: string[];
    tier?: string;
  } | null;
}

export default function ResourceCard({ resource, user }: ResourceCardProps) {
  const dispatch = useAppDispatch();
  const [showReview, setShowReview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = user?.roles?.includes("admin");
  const isCreator = user?.id === resource.uploaded_by;
  const locked =
    resource.tier_access === "paid" && !isAdmin && user?.tier === "free";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await dispatch(deleteResource(resource.id));
    await dispatch(fetchResources());
  };

  // Small helper to detect if file is image
  const isImage = (url: string) =>
    /\.(png|jpg|jpeg|gif|webp)$/i.test(url.split("?")[0]);

  // Get filename from URL
  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      const rawName = decodeURIComponent(parts[parts.length - 1]);
      return rawName.replace(/^\d+_/, "");
    } catch {
      return "File";
    }
  };  

  return (
    <View
      style={[
        styles.cardContainer,
        !resource.is_approved && !isAdmin && styles.cardDimmed,
      ]}
    >
      {/* === Top-right: Edit if creator/admin, else creator avatar === */}
      {(isCreator || isAdmin) ? (
        <TouchableOpacity
          style={styles.editTopRightButton}
          onPress={() => setShowEdit(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Pencil color={colors.accent} size={28} />
        </TouchableOpacity>
      ) : (
        <View style={styles.creatorTopRightWrap} pointerEvents="none">
          {resource.profiles?.[0]?.avatar_url ? (
            <Image
              source={{ uri: resource.profiles[0].avatar_url }}
              style={styles.creatorTopRightAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.creatorTopRightFallback}>
              {resource.profiles?.[0]?.name ? (
                <Text style={styles.creatorTopRightInitials}>
                  {getInitials(resource.profiles[0].name)}
                </Text>
              ) : (
                <User2 color={colors.accent} size={16} />
              )}
            </View>
          )}
        </View>
      )}

      {/* ===== Title + Delete ===== */}
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {resource.title}
        </Text>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.deleteCircle}
            activeOpacity={0.7}
          >
            <MinusCircle color={colors.danger} size={28} />
          </TouchableOpacity>
        )}
      </View>

      {/* ===== File preview ===== */}
      {resource.file_url && !locked && (
        <TouchableOpacity
          onPress={() => Linking.openURL(resource.file_url!)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            // backgroundColor: colors.backgroundDark,
            borderRadius: 8,
            padding: 8,
            marginTop: 6,
          }}
          activeOpacity={0.7}
        >
          {isImage(resource.file_url) ? (
            <Image
              source={{ uri: resource.file_url }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                marginRight: 10,
                backgroundColor: "#f0f0f0",
              }}
              resizeMode="cover"
            />
          ) : (
            <FileText size={32} color={colors.link} style={{ marginRight: 10 }} />
          )}
          <Text
            style={{
              color: colors.link,
              flexShrink: 1,
              fontSize: 20,
              // textDecorationLine: "italics",
            }}
            numberOfLines={1}
          >
            {getFileName(resource.file_url)}
          </Text>
        </TouchableOpacity>
      )}

      {/* ===== Tags ===== */}
      {resource.tags?.length > 0 && (
        <View style={styles.cardTagContainer}>
          {resource.tags.map((tag) => (
            <View key={tag} style={styles.cardTagPill}>
              <Text style={styles.cardTagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      <DeleteConfirmModal
        visible={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* ===== Modals ===== */}
      {isAdmin && (
        <ResourceModal
          visible={showReview}
          onClose={() => setShowReview(false)}
          resource={resource}
          mode="review"
        />
      )}

      {(isAdmin || isCreator) && (
        <ResourceModal
          visible={showEdit}
          onClose={() => setShowEdit(false)}
          resource={resource}
          mode="edit"
        />
      )}
    </View>
  );
}
