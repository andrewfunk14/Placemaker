// learn/fileUpload.tsx
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
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../lib/supabaseClient";
import { PlusCircle, FileText, MinusCircle } from "lucide-react-native";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import { useUser } from "../../app/userContext";
import ImageViewerModal from "../../components/ImageViewerModal";
import { downloadFile } from "../../utils/downloadFile";

interface FileUploadUnifiedProps {
  initialFiles?: string[];
  onChange: (urls: string[]) => void;
  editable?: boolean;
}

export default function FileUploadUnified({
  initialFiles = [],
  onChange,
  editable = true,
}: FileUploadUnifiedProps) {
  const [files, setFiles] = useState<string[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const user = useUser();

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const isImage = (url: string) => /\.(png|jpe?g|gif|webp)$/i.test(url);

  async function uploadToSupabase(assets: { uri: string; name: string; mimeType?: string | null }[]) {
    const uploaded: string[] = [];
    for (const asset of assets) {
      const fileName = `${Date.now()}_${asset.name}`;
      const filePath = `uploads/${user?.userId}/${fileName}`;
      const contentType = asset.mimeType || "application/octet-stream";

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
        .from("resources")
        .upload(filePath, uploadData, { contentType });
      if (error) throw error;

      const { data } = supabase.storage.from("resources").getPublicUrl(filePath);
      if (data?.publicUrl) uploaded.push(data.publicUrl);
    }
    return uploaded;
  }

  async function handlePickFromLibrary() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as any,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (result.canceled) return;

      setUploading(true);
      const assets = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? `photo_${Date.now()}.jpg`,
        mimeType: a.mimeType ?? "image/jpeg",
      }));
      const uploaded = await uploadToSupabase(assets);
      const updated = [...uploaded, ...files];
      setFiles(updated);
      onChange(updated);
    } catch (err: any) {
      Alert.alert("Upload Error", err.message ?? "Failed to upload photo(s).");
    } finally {
      setUploading(false);
    }
  }

  async function handlePickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });
      if (result.canceled) return;

      setUploading(true);
      const assets = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        mimeType: a.mimeType,
      }));
      const uploaded = await uploadToSupabase(assets);
      const updated = [...uploaded, ...files];
      setFiles(updated);
      onChange(updated);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Upload Error", err.message ?? "Failed to upload file(s).");
    } finally {
      setUploading(false);
    }
  }

  function handleAddPress() {
    if (Platform.OS === "web") {
      handlePickFile();
      return;
    }
    Alert.alert("Add File", undefined, [
      { text: "Photo Library", onPress: handlePickFromLibrary },
      { text: "Files", onPress: handlePickFile },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function handleRemove(url: string) {
    try {
      const updated = files.filter((f) => f !== url);
      setFiles(updated);
      onChange(updated);
    } catch (err) {
      console.error("Remove failed:", err);
      Alert.alert("Error", "Failed to remove file.");
    }
  }

  return (
    <View>
      {editable && (
        <TouchableOpacity
          onPress={handleAddPress}
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
              onPress={() => isImage(url) ? setViewingImage(url) : downloadFile(url)}
              activeOpacity={0.8}
              style={styles.filePreviewCard}
            >
              {isImage(url) ? (
                <Image source={{ uri: url }} style={styles.modalPreviewImage} />
              ) : (
                <FileText size={32} color={colors.link} style={styles.filePreviewIcon} />
              )}
              <Text numberOfLines={1} style={styles.filePreviewName}>
                {decodeURIComponent(url.split("/").pop() ?? "File").replace(/^\d+_/, "")}
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
      <ImageViewerModal uri={viewingImage} onClose={() => setViewingImage(null)} />
    </View>
  );
}
