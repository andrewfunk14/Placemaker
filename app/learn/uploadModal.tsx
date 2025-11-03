// learn/uploadModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "../../lib/supabaseClient";
import { useAppDispatch } from "../../store/hooks";
import {
  uploadResource,
  fetchResources,
} from "../../store/slices/resourcesSlice";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import ResourceTagDropdown from "./resourceTagDropdown";
import { Upload } from "lucide-react-native";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UploadModal({ visible, onClose }: UploadModalProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // === FILE PICKER (web + mobile) ===
  const handlePickFile = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
  
      if (result.canceled) return;
  
      const file = result.assets[0];
      setFileName(file.name);
      setUploadingFile(true);
  
      const filePath = `uploads/${Date.now()}_${file.name}`;
      let uploadData: Blob | ArrayBuffer;
      const contentType = file.mimeType || "application/octet-stream";
  
      if (Platform.OS === "web") {
        // 🖥 Web: fetch as blob
        const response = await fetch(file.uri);
        uploadData = await response.blob();
      } else {
        // 📱 Mobile: read file as base64 and decode to ArrayBuffer
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        uploadData = decode(base64);
      }
  
      const { error } = await supabase.storage
        .from("resources")
        .upload(filePath, uploadData, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });
  
      if (error) throw error;
  
      const { data: publicData } = supabase.storage
        .from("resources")
        .getPublicUrl(filePath);
  
      if (!publicData?.publicUrl)
        throw new Error("No public URL returned for uploaded file.");
  
      setFileUrl(publicData.publicUrl);
      // Alert.alert("✅ Success", "File uploaded successfully!");
    } catch (err: any) {
      console.error("File upload failed:", err);
      Alert.alert("Upload Failed", err.message || "Something went wrong.");
    } finally {
      setUploadingFile(false);
    }
  };

  // === SUBMIT RESOURCE ===
  const handleSubmit = async () => {
    if (!title.trim())
      return Alert.alert("Missing Info", "Please enter a title.");
    if (tags.length === 0)
      return Alert.alert("Missing Info", "Please choose at least one topic tag.");
    if (!fileUrl)
      return Alert.alert("Missing File", "Please upload a file before submitting.");

    try {
      setSubmitting(true);
      await dispatch(
        uploadResource({
          title,
          description,
          tier_access: null,
          file_url: fileUrl,
          is_approved: false,
          tags,
        })
      );

      await dispatch(fetchResources());
      Alert.alert("Submitted", "Your resource has been sent for admin review.");

      // Reset form
      setTitle("");
      setDescription("");
      setTags([]);
      setFileName(null);
      setFileUrl(null);
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit resource. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalCardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Resource</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={colors.placeholderText}
              value={title}
              onChangeText={setTitle}
            />

            <ResourceTagDropdown value={tags} onSelect={setTags} />

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.placeholderText}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              onPress={handlePickFile}
              disabled={uploadingFile || submitting}
              style={styles.fileButton}
            >
              {fileName ? (
                <Text style={styles.fileButtonText}>📄 {fileName}</Text>
              ) : (
                <View style={styles.fileButtonInner}>
                  <Upload size={20} color={colors.link} style={styles.fileIcon} />
                  <Text style={styles.fileButtonText}>
                    {uploadingFile ? "Uploading..." : "Select File"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.buttonGhost]}
                disabled={submitting}
              >
                <Text style={styles.buttonGhostText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.button}
                disabled={uploadingFile || submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
