// build/projectFileUpload.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../lib/supabaseClient";
import { PlusCircle, MinusCircle } from "lucide-react-native";
import { buildStyles as styles, colors } from "../../styles/buildStyles";
import { useUser } from "../../app/userContext";
import { pickImageCompat, convertToJpegIfNeeded, isHeicUri } from "../../utils/imagePickerCompat";
import ImageViewerModal from "../../components/ImageViewerModal";
import ImageCropModal from "../../components/ImageCropModal";

const PROJECT_BUCKET = "projects";

interface ProjectFileUploadProps {
  initialFiles?: string[];
  onChange: (urls: string[]) => void;
  editable?: boolean;
}

export default function ProjectFileUpload({
  initialFiles = [],
  onChange,
  editable = true,
}: ProjectFileUploadProps) {
  const [files, setFiles] = useState<string[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [rawPickedAsset, setRawPickedAsset] = useState<{
    uri: string;
    width?: number;
    height?: number;
  } | null>(null);
  const { userId } = useUser();

  if (!userId) {
    return null;
  }
  
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const isAllowedImageAsset = (name?: string, mimeType?: string) => {
    if (Platform.OS === "web") {
      // HEIC cannot be decoded by most web browsers
      const heicMime = !!mimeType && /image\/(heic|heif)/i.test(mimeType);
      const heicExt = !!name && /\.(heic|heif)$/i.test(name);
      if (heicMime || heicExt) return false;
    }
    const okMime = !!mimeType && mimeType.startsWith("image/");
    const okExt = !!name && /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(name);
    return okMime || okExt;
  };

  async function uploadOneImage(asset: {
    uri: string;
    name?: string | null;
    mimeType?: string | null;
  }) {
    const extFromName =
      asset.name?.split(".").pop()?.toLowerCase() ||
      (asset.mimeType?.split("/")[1]?.toLowerCase() ?? "jpg");

    const heicMap: Record<string, string> = { heic: "jpg", heif: "jpg" };
    const safeExt =
      heicMap[extFromName] ??
      (["jpg", "jpeg", "png", "webp", "gif"].includes(extFromName) ? extFromName : "jpg");

    const baseName = asset.name?.split("/").pop() ?? "";
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(baseName);
    const isNumericOrTimestamp = /^\d{7,}/.test(baseName.split(".")[0]);
    const humanName =
      baseName && !isUuid && !isNumericOrTimestamp ? baseName : `image.${safeExt}`;
    const fileName = `${Date.now()}_${humanName}`;
    const filePath = `uploads/${userId}/${fileName}`;
    const contentType =
      asset.mimeType || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`;

    let uploadData: Blob | ArrayBuffer;

    if (Platform.OS === "web") {
      const response = await fetch(asset.uri);
      uploadData = await response.blob();
    } else {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      uploadData = decode(base64);
    }

    const { error } = await supabase.storage
      .from(PROJECT_BUCKET)
      .upload(filePath, uploadData, { contentType });

    if (error) throw error;

    const { data } = supabase.storage.from(PROJECT_BUCKET).getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error("Failed to get public URL.");
    return data.publicUrl;
  }

  async function handlePickImages() {
    try {
      // MOBILE: pick first, then setUploading(true) only if a photo was selected
      if (Platform.OS !== "web") {
        const result = await pickImageCompat();
        if ((result as any)?.canceled) return;
        const asset = (result as any)?.assets?.[0];
        if (!asset?.uri) return;
        setRawPickedAsset({ uri: asset.uri, width: asset.width, height: asset.height });
        return;
      }

      // ✅ WEB: pick first, verify selection, then setUploading(true)
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: true,
      });
      if (result.canceled) return;

      const selected = (result.assets ?? []).filter((a) =>
        isAllowedImageAsset(a.name, a.mimeType)
      );

      if (selected.length === 0) {
        Alert.alert("Images only", "Please select image files (PNG/JPG/WEBP/GIF). HEIC is not supported on web — upload from iOS or Android instead.");
        return;
      }

      setUploading(true);

      try {
        const uploaded: string[] = [];
        for (const asset of selected) {
          const publicUrl = await uploadOneImage({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType,
          });
          uploaded.push(publicUrl);
        }

        const updated = [...uploaded, ...files];
        setFiles(updated);
        onChange(updated);
      } finally {
        setUploading(false);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Upload Error", err.message ?? "Failed to upload image(s).");
      setUploading(false);
    }
  }

  async function handleCropComplete(croppedUri: string) {
    setRawPickedAsset(null);
    setUploading(true);
    try {
      const safeUri = isHeicUri(croppedUri)
        ? await convertToJpegIfNeeded(croppedUri)
        : croppedUri;
      const publicUrl = await uploadOneImage({ uri: safeUri, name: "image.jpg", mimeType: "image/jpeg" });
      const updated = [publicUrl, ...files];
      setFiles(updated);
      onChange(updated);
    } catch (err: any) {
      Alert.alert("Upload Error", err.message ?? "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  const extractStoragePath = (publicUrl: string): string | null => {
    const marker = "/object/public/";
    const markerIndex = publicUrl.indexOf(marker);
    if (markerIndex === -1) return null;
    const afterMarker = publicUrl.slice(markerIndex + marker.length);
    const firstSlash = afterMarker.indexOf("/");
    if (firstSlash === -1) return null;
    return afterMarker.slice(firstSlash + 1);
  };

  async function handleRemove(url: string) {
    try {
      const updated = files.filter((f) => f !== url);
      setFiles(updated);
      onChange(updated);

      const path = extractStoragePath(url);
      if (path) await supabase.storage.from(PROJECT_BUCKET).remove([path]);
    } catch (err) {
      console.error("Remove failed:", err);
      Alert.alert("Error", "Failed to remove image.");
    }
  }

  return (
    <View>
      {editable && (
        <TouchableOpacity
          onPress={handlePickImages}
          style={styles.fileUploadButton}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <View style={styles.uploadFileButtonContent}>
            <PlusCircle size={30} color={colors.link} strokeWidth={2} />
            <Text style={styles.uploadFileText}>
              {uploading ? "Uploading..." : "File Upload"}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {files.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {files.map((url, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setViewingImage(url)}
              activeOpacity={0.85}
              style={styles.filePreviewCard}
            >
              <Image
                source={{ uri: url }}
                style={styles.modalPreviewImage}
                resizeMode="cover"
              />
              <Text numberOfLines={1} style={styles.filePreviewName}>
                {decodeURIComponent(url.split("/").pop() ?? "Image").replace(
                  /^\d+_/,
                  ""
                )}
              </Text>
              {editable && (
                <TouchableOpacity
                  onPress={() => handleRemove(url)}
                  style={styles.filePreviewRemove}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MinusCircle size={28} color={colors.danger} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <ImageViewerModal uri={viewingImage} onClose={() => setViewingImage(null)} />
      {rawPickedAsset && (
        <ImageCropModal
          imageUri={rawPickedAsset.uri}
          imageWidth={rawPickedAsset.width}
          imageHeight={rawPickedAsset.height}
          visible={true}
          onCancel={() => setRawPickedAsset(null)}
          onCrop={handleCropComplete}
        />
      )}
    </View>
  );
}
