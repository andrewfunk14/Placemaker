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
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as WebBrowser from "expo-web-browser";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../lib/supabaseClient";
import { PlusCircle, MinusCircle } from "lucide-react-native";
import { buildStyles as styles, colors } from "../../styles/buildStyles";
import { useUser } from "../../app/userContext";
import { pickImageCompat } from "../../utils/imagePickerCompat";

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
  const { userId } = useUser();

  if (!userId) {
    return null;
  }
  
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const openFile = async (url: string) => {
    try {
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        const supported = await Linking.canOpenURL(url);
        if (supported) await WebBrowser.openBrowserAsync(url);
      }
    } catch {
      Alert.alert("Error", "Failed to open image.");
    }
  };

  const isAllowedImageAsset = (name?: string, mimeType?: string) => {
    const okMime = !!mimeType && mimeType.startsWith("image/");
    const okExt = !!name && /\.(png|jpe?g|gif|webp)$/i.test(name);
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

    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(extFromName)
      ? extFromName
      : "jpg";

    const fileName = `${Date.now()}_${Math.random().toString(16).slice(2)}.${safeExt}`;
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
      // ✅ MOBILE: pick first, THEN setUploading(true) only if a photo was selected
      if (Platform.OS !== "web") {
        const result = await pickImageCompat();
        if ((result as any)?.canceled) return;

        const asset = (result as any)?.assets?.[0];
        if (!asset?.uri) return;

        setUploading(true); // ✅ moved here

        try {
          const publicUrl = await uploadOneImage({
            uri: asset.uri,
            name: asset.fileName ?? "image.jpg",
            mimeType: asset.mimeType ?? "image/jpeg",
          });

          const updated = [publicUrl, ...files];
          setFiles(updated);
          onChange(updated);
        } finally {
          setUploading(false);
        }

        return;
      }

      // ✅ WEB: pick first, verify selection, THEN setUploading(true)
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: true,
      });
      if (result.canceled) return;

      const selected = (result.assets ?? []).filter((a) =>
        isAllowedImageAsset(a.name, a.mimeType)
      );

      if (selected.length === 0) {
        Alert.alert("Images only", "Please select image files (PNG/JPG/WEBP/GIF).");
        return;
      }

      setUploading(true); // ✅ moved here

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
              onPress={() => openFile(url)}
              activeOpacity={0.8}
              style={styles.filePreviewCard}
            >
              <Image source={{ uri: url }} style={styles.modalPreviewImage} />
              <Text numberOfLines={1} style={styles.filePreviewName}>
                {decodeURIComponent(url.split("/").pop() ?? "Image").replace(
                  /^\d+_/,
                  ""
                )}
              </Text>

              {editable && (
                <TouchableOpacity
                  onPress={() => handleRemove(url)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MinusCircle size={28} color={colors.danger} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
