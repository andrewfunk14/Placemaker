// learn/uploadModal.tsx
import React, { useState, useEffect, useRef } from "react";
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
import { useAppDispatch } from "../../store/hooks/hooks";
import { uploadResource } from "../../store/slices/resourcesSlice";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import ResourceTagDropdown from "./tagDropdown";
import FileUpload from "./fileUpload";
import type { Resource } from "../../store/slices/resourcesSlice";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../../app/userContext";

function extractStoragePath(url: string): string | null {
  try {
    const match = url.match(/\/object\/public\/resources\/(.+)$/);
    if (match && match[1]) return match[1];
    const parts = url.split("/");
    const uploadsIndex = parts.indexOf("uploads");
    if (uploadsIndex !== -1 && parts.length > uploadsIndex + 1) {
      return `uploads/${parts.slice(uploadsIndex + 1).join("/")}`;
    }
    return null;
  } catch {
    return null;
  }
}

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  resource?: Resource | null;
}

export default function UploadModal({
  visible,
  onClose,
  mode = "add",
  resource = null,
}: UploadModalProps) {
  const dispatch = useAppDispatch();
  const user = useUser();
  const isAdmin = user?.roles?.includes("admin");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [initialFiles, setInitialFiles] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<string[]>([]);
  const [removedNewFiles, setRemovedNewFiles] = useState<string[]>([]);
  const prevUrlsRef = useRef<string[]>([]);

  const uploadedThisSessionRef = useRef<string[]>([]);

  useEffect(() => {
    if (mode === "edit" && resource) {
      const urls = Array.isArray(resource.file_urls)
        ? resource.file_urls.filter(Boolean)
        : resource.file_urls
        ? [resource.file_urls]
        : [];

      setTitle(resource.title || "");
      setDescription(resource.description || "");
      setTags(resource.tags || []);
      setUploadedUrls(urls);
      setInitialFiles(urls);
      prevUrlsRef.current = urls;
    } else {
      resetForm();
      setInitialFiles([]);
      prevUrlsRef.current = [];
    }
    setNewFiles([]);
    setRemovedNewFiles([]);
  }, [mode, resource, visible]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setUploadedUrls([]);
  };

  const handleCancel = async () => {
    try {
      const allUploadedThisSession = uploadedThisSessionRef.current;
      if (allUploadedThisSession.length > 0) {
        const paths = allUploadedThisSession.map(extractStoragePath).filter(Boolean) as string[];
        if (paths.length > 0) {
          console.log("🧹 Removing all session uploads on cancel:", paths);
          const { error } = await supabase.storage.from("resources").remove(paths);
          if (error) console.error("⚠️ Cancel cleanup error:", error);
        }
      }
    } catch (err) {
      console.error("Cancel cleanup failed:", err);
    } finally {
      uploadedThisSessionRef.current = [];
      resetForm();
      setNewFiles([]);
      setRemovedNewFiles([]);
      setErrorMessage(null);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage("Missing Title");
      return;
    }

    try {
      setSubmitting(true);

      const oldFiles =
        mode === "edit" && resource
          ? Array.isArray(resource.file_urls)
            ? resource.file_urls.filter(Boolean)
            : resource.file_urls
            ? [resource.file_urls]
            : []
          : [];

      const removedOldFiles = oldFiles.filter((url) => !uploadedUrls.includes(url));
      const allRemoved = Array.from(new Set([...removedOldFiles, ...removedNewFiles]));

      if (allRemoved.length > 0) {
        const paths = allRemoved.map(extractStoragePath).filter(Boolean) as string[];
        if (paths.length > 0) {
          await supabase.storage.from("resources").remove(paths);
        }
      }

      if (mode === "edit" && resource) {
        const { error } = await supabase
          .from("resources")
          .update({
            title: title.trim(),
            description: description?.trim() || null,
            tags,
            file_urls: uploadedUrls,
            updated_at: new Date().toISOString(),
            is_approved: false,
          })
          .eq("id", resource.id);
        if (error) throw error;
      } else {
        await dispatch(
          uploadResource({
            title: title.trim(),
            description: description?.trim() || null,
            tags,
            tier_access: null,
            file_urls: uploadedUrls,
            is_approved: false,
          })
        );
      }

      resetForm();
      setNewFiles([]);
      setRemovedNewFiles([]);

      setTimeout(() => onClose(), 50);
    } catch (err: any) {
      console.error("Submit failed:", err);
      Alert.alert("Error", err.message || "Failed to save resource.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent onRequestClose={handleCancel}>
      <Pressable
        style={[
          styles.modalBackdrop,
          submitting && { backgroundColor: "rgba(0,0,0,0.6)" },
        ]}
        disabled={submitting}
        onPress={handleCancel}
      />
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
              {mode === "edit" ? "Edit Resource" : "New Resource"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={colors.placeholderText}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage && text.trim()) setErrorMessage(null);
              }}
            />

            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

            <ResourceTagDropdown value={tags} onSelect={setTags} />

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.placeholderText}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <FileUpload
              initialFiles={uploadedUrls}
              onChange={(urls) => {
                const prev = prevUrlsRef.current;
                const added = urls.filter((u) => !prev.includes(u));
                const removed = prev.filter((u) => !urls.includes(u));

                if (added.length > 0) {
                  uploadedThisSessionRef.current = [
                    ...new Set([...uploadedThisSessionRef.current, ...added]),
                  ];
                }    

                if (removed.length > 0) {
                  const removedWereNew = removed.filter(
                    (u) => !initialFiles.includes(u)
                  );
                  if (removedWereNew.length > 0) {
                    setRemovedNewFiles((prevRem) => [
                      ...new Set([...prevRem, ...removedWereNew]),
                    ]);
                  }

                  setNewFiles((prevNew) => prevNew.filter((u) => !removed.includes(u)));
                }

                setUploadedUrls(urls);
                prevUrlsRef.current = urls;
              }}
              editable={true}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.button, styles.buttonGhost]}
                disabled={submitting}
              >
                <Text style={styles.buttonGhostText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.button}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting
                    ? mode === "edit"
                      ? "Saving..."
                      : "Submitting..."
                    : mode === "edit"
                    ? "Save"
                    : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
