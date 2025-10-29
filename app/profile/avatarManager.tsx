// profile/avatarManager.tsx
import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
  Image as RNImage,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { useAppDispatch } from "../../store/hooks";
import { uploadAvatar, type Profile } from "../../store/slices/profileSlice";
import { profileStyles as styles } from "../../styles/profileStyles";
import WebCropper from "./webCropper";
import { getCroppedDataUrlWeb, type CropPixels } from "../../utils/cropHelpers";
import { pickImageCompat } from "../../utils/imagePickerCompat";

type Maybe<T> = T | null | undefined;

interface AvatarManagerProps {
  profile: Maybe<Profile>;
  userId: Maybe<string>;
  authUser?: Maybe<{ email?: Maybe<string> }>;
  inModal?: boolean;
  tempUri?: string | null;
  setTempUri?: (uri: string | null) => void;
}

export default function AvatarManager({
  profile,
  userId,
  authUser,
  inModal = false,
  tempUri,
  setTempUri,
}: AvatarManagerProps) {
  const dispatch = useAppDispatch();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const croppedPixelsRef = useRef<CropPixels | null>(null);

  // === Upload handler (only used outside modal) ===
  const processAndUpload = useCallback(
    async (sourceUri: string) => {
      if (!userId || !sourceUri) return;
      try {
        setAvatarUploading(true);
        let outUri = sourceUri;

        if (Platform.OS !== "web") {
          const manipulated = await ImageManipulator.manipulateAsync(
            sourceUri,
            [{ resize: { width: 512 } }],
            { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
          );
          outUri = manipulated.uri;
        }

        await dispatch(uploadAvatar({ userId, fileUri: outUri })).unwrap();
        setPreviewOpen(false);
        setPreviewUri(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        Alert.alert("Upload Failed", msg || "Could not upload avatar.");
      } finally {
        setAvatarUploading(false);
      }
    },
    [dispatch, userId]
  );

  // === Image picker handler ===
  const handlePickImage = useCallback(async () => {
    const res = await pickImageCompat();
    if (res.canceled || !res.assets?.length) return;
    const uri = res.assets[0]?.uri;
    if (!uri) return;

    if (Platform.OS === "web") {
      // 🧩 Always open WebCropper for web
      setPreviewUri(uri);
      setPreviewOpen(true);
      return;
    }

    if (inModal && setTempUri) {
      // On native inside modal → just preview locally (no upload yet)
      setTempUri(uri);
      return;
    }

    // On native outside modal → upload immediately
    await processAndUpload(uri);
  }, [processAndUpload, inModal, setTempUri]);

  const displayedUri =
    inModal && tempUri ? tempUri : profile?.avatar_url ?? null;

  return (
    <View style={styles.avatarWrap}>
      {/* Avatar — only clickable inside modal */}
      <TouchableOpacity
        onPress={inModal ? handlePickImage : undefined}
        activeOpacity={inModal ? 0.7 : 1}
        disabled={!inModal || avatarUploading}
      >
        <View
          style={[
            styles.avatarContainer,
            inModal && styles.avatarContainerClickable,
          ]}
        >
          {displayedUri ? (
            <RNImage source={{ uri: displayedUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>
                {(profile?.name?.[0] ?? authUser?.email?.[0] ?? "P").toUpperCase()}
              </Text>
            </View>
          )}

          {/* "Edit" overlay */}
          {inModal && (
            <View style={styles.avatarOverlay} pointerEvents="none">
              <Text style={styles.avatarOverlayText}>Edit</Text>
            </View>
          )}

          {/* Uploading spinner */}
          {avatarUploading && (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* === WebCropper Modal (now works for modal editing too) === */}
      {Platform.OS === "web" && previewOpen && (
        <Modal visible animationType="slide" transparent>
          <View style={[styles.center, styles.modalBackdrop]}>
            <View style={styles.pictureModalCard}>
              <WebCropper
                src={previewUri!}
                onCropComplete={(px: CropPixels) => {
                  croppedPixelsRef.current = px;
                }}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => {
                    setPreviewOpen(false);
                    setPreviewUri(null);
                  }}
                  style={[styles.button, styles.buttonGhost]}
                >
                  <Text style={styles.buttonGhostText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    const px = croppedPixelsRef.current;
                    if (!previewUri) return;

                    const cropped = px
                      ? await getCroppedDataUrlWeb(previewUri, px)
                      : previewUri;

                    if (inModal && setTempUri) {
                      // ✅ store locally inside modal
                      setTempUri(cropped);
                      setPreviewOpen(false);
                      return;
                    }

                    // ✅ otherwise upload directly (outside modal)
                    await processAndUpload(cropped);
                  }}
                  style={[styles.button, styles.buttonPrimary]}
                  disabled={avatarUploading}
                >
                  <Text style={styles.buttonText}>
                    {avatarUploading ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
