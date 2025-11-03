// learn/resourceModal.tsx
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
  Image,
  Alert,
  Linking,
} from "react-native";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import { supabase } from "../../lib/supabaseClient";
import { useAppDispatch } from "../../store/hooks";
import {
  approveResource,
  fetchResources,
} from "../../store/slices/resourcesSlice";
import ResourceTagDropdown from "./resourceTagDropdown";
import ResourceTierDropdown from "./resourceTierDropdown";
import type { Resource } from "../../store/slices/resourcesSlice";

interface ResourceModalProps {
  visible: boolean;
  onClose: () => void;
  resource: Resource;
  mode: "edit" | "review";
}

export default function ResourceModal({
  visible,
  onClose,
  resource,
  mode,
}: ResourceModalProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description ?? "");
  const [tags, setTags] = useState<string[]>(resource.tags ?? []);
  const [tier, setTier] = useState<"free" | "paid" | null>(
    resource.tier_access ?? null
  );
  const [submitting, setSubmitting] = useState(false);

  // === FILE PREVIEW ===
  const renderFilePreview = () => {
    if (!resource.file_url) return null;
    const fileUrl = resource.file_url;
    const ext = fileUrl.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return (
        <View style={styles.filePreviewContainer}>
          <Image
            source={{ uri: fileUrl }}
            style={styles.filePreviewImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => Linking.openURL(fileUrl)}
            style={styles.fileLinkWrap}
          >
            <Text style={styles.fileLinkText}>View Image</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (ext === "pdf") {
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(fileUrl)}
          style={styles.fileLinkWrap}
        >
          <Text style={styles.fileLinkText}>📄 View PDF</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => Linking.openURL(fileUrl)}
        style={styles.fileLinkWrap}
      >
        <Text style={styles.fileLinkText}>📎 Open File</Text>
      </TouchableOpacity>
    );
  };

  // === APPROVE ===
  const handleApprove = async () => {
    if (!tier) {
      Alert.alert("Missing Info", "Please select a tier before approving.");
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(approveResource({ id: resource.id, tier_access: tier }));
      await dispatch(fetchResources());
      Alert.alert("Success", "Resource approved successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to approve resource.");
    } finally {
      setSubmitting(false);
    }
  };

  // === SAVE ===
  const handleSave = async () => {
    if (!title.trim())
      return Alert.alert("Missing Info", "Please enter a title.");

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("resources")
        .update({
          title,
          description,
          tags,
          tier_access: tier ?? "free",
        })
        .eq("id", resource.id);

      if (error) throw error;

      await dispatch(fetchResources());
      Alert.alert("Updated", "Resource saved successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to update resource.");
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
            <Text style={styles.modalTitle}>
              {mode === "review" ? "Review Resource" : "Edit Resource"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={colors.placeholderText}
              value={title}
              onChangeText={setTitle}
              editable={mode === "edit"}
            />

            <ResourceTagDropdown value={tags} onSelect={setTags} />
            <ResourceTierDropdown value={tier} onSelect={setTier} />

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Description"
              placeholderTextColor={colors.placeholderText}
              value={description}
              onChangeText={setDescription}
              multiline
              editable={mode === "edit"}
            />

            {renderFilePreview()}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.buttonGhost]}
                disabled={submitting}
              >
                <Text style={styles.buttonGhostText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={mode === "review" ? handleApprove : handleSave}
                style={styles.button}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting
                    ? mode === "review"
                      ? "Approving..."
                      : "Saving..."
                    : mode === "review"
                    ? "Approve"
                    : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}