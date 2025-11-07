// learn/resourceCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import type { Resource } from "../../store/slices/resourcesSlice";
import { useAppDispatch } from "../../store/hooks";
import {
  deleteResource,
  fetchResources,
} from "../../store/slices/resourcesSlice";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import AdminModal from "./adminModal";
import UploadModal from "./uploadModal";
import {
  Pencil,
  User2,
  MinusCircle,
  FileText,
  CheckCircle,
  Circle,
} from "lucide-react-native";
import DeleteConfirmModal from "./deleteConfirmModal";
import * as WebBrowser from "expo-web-browser";
import { useUser } from "../../app/userContext";
import TierBadge from "./tierBadge";

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
  const contextUser = useUser();

  const [showReview, setShowReview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = contextUser?.roles?.includes("admin");

  const resourceCreatorId =
    typeof resource.uploaded_by === "object"
      ? resource.uploaded_by?.id
      : resource.uploaded_by;

  const isCreator =
    contextUser?.userId === resourceCreatorId ||
    user?.id === resourceCreatorId;

  const handleDelete = async () => {
    if (!isAdmin && !isCreator) {
      Alert.alert("Unauthorized", "You don't have permission to delete this resource.");
      return;
    }
    setShowDeleteConfirm(false);
    await dispatch(deleteResource(resource.id));
    await dispatch(fetchResources());
  };

  const isImage = (url: string) =>
    /\.(png|jpg|jpeg|gif|webp)$/i.test(url.split("?")[0]);

  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      const rawName = decodeURIComponent(parts[parts.length - 1]);
      return rawName.replace(/^[a-f0-9]{64}_/, "").replace(/^\d+_/, "");
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
      {(isCreator || (isAdmin && isCreator)) ? (
        <TouchableOpacity
          style={styles.editTopRightButton}
          onPress={() => setShowEdit(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Pencil color={colors.accent} size={28} />
        </TouchableOpacity>
      ) : isAdmin ? (
        <View style={styles.creatorTopRightWrap} pointerEvents="none">
          {typeof resource.uploaded_by === "object" && resource.uploaded_by?.avatar_url ? (
            <Image
              source={{ uri: resource.uploaded_by.avatar_url }}
              style={styles.creatorTopRightAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.creatorTopRightFallback}>
              <User2 color={colors.accent} size={30} />
            </View>
          )}
        </View>    
      ) : (
        <View style={styles.creatorTopRightWrap} pointerEvents="none">
          {typeof resource.uploaded_by === "object" && resource.uploaded_by?.avatar_url ? (
            <Image
              source={{ uri: resource.uploaded_by.avatar_url }}
              style={styles.creatorTopRightAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.creatorTopRightFallback}>
              <User2 color={colors.accent} size={30} />
            </View>
          )}
        </View>
      )}

      <View style={styles.titleRow}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {resource.title}
        </Text>
        {(isAdmin || isCreator) && (
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.deleteCircle}
            activeOpacity={0.7}
          >
            <MinusCircle color={colors.danger} size={28} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => setShowReview(true)}
            style={[
              styles.reviewStatusButton,
              !resource.is_approved || !resource.tier_access
                ? styles.reviewPending
                : styles.reviewApproved,
            ]}
            activeOpacity={!resource.is_approved || !resource.tier_access ? 0.8 : 1}
          >
            {!resource.is_approved || !resource.tier_access ? (
              <Circle
                color={colors.accent}
                size={20}
                strokeWidth={2}
                style={{ marginRight: 6 }}
              />
            ) : (
              <CheckCircle color="#9ae66e" size={20} style={{ marginRight: 6 }} />
            )}

            <Text
              style={[
                styles.reviewStatusText,
                !resource.is_approved || !resource.tier_access
                  ? styles.reviewPendingText
                  : styles.reviewApprovedText,
              ]}
            >
              {!resource.is_approved || !resource.tier_access
                ? "Review"
                : "Approved"}
            </Text>
          </TouchableOpacity>
        )}

        {!isAdmin && isCreator && (
          <View
            style={[
              styles.reviewStatusButton,
              !resource.is_approved ? styles.reviewPending : styles.reviewApproved,
              { opacity: 0.9 },
            ]}
          >
            {!resource.is_approved ? (
              <Circle
                color={colors.accent}
                size={20}
                strokeWidth={2}
                style={{ marginRight: 6 }}
              />
            ) : (
              <CheckCircle color="#9ae66e" size={20} style={{ marginRight: 6 }} />
            )}
            <Text
              style={[
                styles.reviewStatusText,
                !resource.is_approved
                  ? styles.reviewPendingText
                  : styles.reviewApprovedText,
              ]}
            >
              {resource.is_approved ? "Approved" : "Pending Approval"}
            </Text>
          </View>
        )}

        <TierBadge tier={resource.tier_access} />
      </View>

      {resource.description ? (
        <Text style={styles.cardDescription} numberOfLines={4}>
          {String(resource.description)}
        </Text>
      ) : null}

      {Array.isArray(resource.file_urls) && resource.file_urls.length > 0 && (
        <View>
          {resource.file_urls.map((url, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => WebBrowser.openBrowserAsync(url)}
              style={[styles.cardFileItem, idx === 0 && { marginTop: 0 }]}
              activeOpacity={0.7}
            >
              {isImage(url) ? (
                <Image
                  source={{ uri: url }}
                  style={styles.cardFileImage}
                  resizeMode="cover"
                />
              ) : (
                <FileText size={28} color={colors.link} style={{ marginRight: 10 }} />
              )}
              <Text style={styles.cardFileText} numberOfLines={1}>
                {getFileName(url)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

{resource.tags?.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.cardTagContainer}
    style={{ marginTop: 6 }}
  >
    {resource.tags.map((tag) => (
      <View key={tag} style={styles.cardTagPill}>
        <Text style={styles.cardTagText}>#{tag}</Text>
      </View>
    ))}
  </ScrollView>
)}


      {/* {resource.tags?.length > 0 && (
        <View style={styles.cardTagContainer}>
          {resource.tags.map((tag) => (
            <View key={tag} style={styles.cardTagPill}>
              <Text style={styles.cardTagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )} */}

      <DeleteConfirmModal
        visible={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {isAdmin && (
        <AdminModal
          visible={showReview}
          onClose={() => setShowReview(false)}
          resource={resource}
        />
      )}

      {isCreator && (
        <UploadModal
          visible={showEdit}
          onClose={() => setShowEdit(false)}
          mode="edit"
          resource={resource}
        />
      )}
    </View>
  );
}

