// learn/adminModal.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
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
import { supabase } from "../../lib/supabaseClient";
import { useAppDispatch } from "../../store/hooks";
import { fetchResources } from "../../store/slices/resourcesSlice";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import ResourceTagDropdown from "./tagDropdown";
import ResourceTierDropdown from "./tierDropdown";
import FileUpload from "./fileUpload";
import type { Resource } from "../../store/slices/resourcesSlice";
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

export default function AdminModal({
  visible,
  onClose,
  resource,
}: {
  visible: boolean;
  onClose: () => void;
  resource: Resource;
}) {
  const dispatch = useAppDispatch();
  const user = useUser();
  const isAdmin = user?.roles?.includes("admin");

  const initialFiles = useMemo<string[]>(() => {
    if (!resource.file_urls) return [];
    if (Array.isArray(resource.file_urls)) return resource.file_urls.filter(Boolean);
    try {
      const parsed = JSON.parse(resource.file_urls);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [resource.file_urls];
    } catch {
      return [resource.file_urls];
    }
  }, [resource.file_urls]);

  const [title, setTitle] = useState(resource.title ?? "");
  const [description, setDescription] = useState(resource.description ?? "");
  const [tags, setTags] = useState<string[]>(resource.tags ?? []);
  const [tier, setTier] = useState<"free" | "paid" | null>(resource.tier_access ?? null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialFiles);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newFiles, setNewFiles] = useState<string[]>([]);
  const [removedNewFiles, setRemovedNewFiles] = useState<string[]>([]);
  const prevUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    setUploadedUrls(initialFiles);
    setNewFiles([]);
    setRemovedNewFiles([]);
    prevUrlsRef.current = initialFiles;
  }, [initialFiles, visible]);

  const handleCancel = async () => {
    try {
      if (newFiles.length > 0) {
        const pathsToDelete = newFiles
          .map((url) => extractStoragePath(url))
          .filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
          console.log("🧹 Deleting unsaved admin files:", pathsToDelete);
          const { error: removeError } = await supabase.storage
            .from("resources")
            .remove(pathsToDelete);

          if (removeError) console.error("⚠️ Cancel cleanup error:", removeError);
        }
      }
    } catch (err) {
      console.error("Cancel cleanup failed:", err);
    } finally {
      setTitle(resource.title ?? "");
      setDescription(resource.description ?? "");
      setTags(resource.tags ?? []);
      setTier(resource.tier_access ?? null);
      setUploadedUrls(initialFiles);
      setNewFiles([]);
      setRemovedNewFiles([]);
      setErrorMessage(null);
      onClose();
    }
  };

  const handleApprove = async () => {
    if (isAdmin && !tier) {
      setErrorMessage("Missing Tier");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const oldFiles = Array.isArray(resource.file_urls)
        ? resource.file_urls.filter(Boolean)
        : resource.file_urls
        ? [resource.file_urls]
        : [];

      const removedOldFiles = oldFiles.filter((url) => !uploadedUrls.includes(url));
      const allRemoved = Array.from(new Set([...removedOldFiles, ...removedNewFiles]));

      if (allRemoved.length > 0) {
        const pathsToDelete = allRemoved
          .map((url) => extractStoragePath(url))
          .filter(Boolean) as string[];
        if (pathsToDelete.length > 0) {
          console.log("🗑 Deleting removed files from Supabase:", pathsToDelete);
          const { error: removeError } = await supabase.storage
            .from("resources")
            .remove(pathsToDelete);
          if (removeError) console.error("⚠️ Supabase delete error:", removeError);
        }
      }

      const { error } = await supabase
        .from("resources")
        .update({
          title: title.trim(),
          description: description?.trim() || null,
          tags,
          tier_access: tier,
          file_urls: [...new Set(uploadedUrls)],
          is_approved: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resource.id);

      if (error) throw error;

      await dispatch(fetchResources()).unwrap();
      setNewFiles([]);
      setRemovedNewFiles([]);
      onClose();
    } catch (err) {
      console.error("Approve error:", err);
      Alert.alert("Error", "Failed to approve resource.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleCancel}>
      <Pressable style={styles.modalBackdrop} onPress={handleCancel} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalCardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Review Resource</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={colors.placeholderText}
              value={title}
              onChangeText={setTitle}
            />

            <ResourceTagDropdown value={tags} onSelect={setTags} />

            {isAdmin && (
              <ResourceTierDropdown
                value={tier}
                onSelect={(value) => {
                  setTier(value);
                  if (errorMessage && value) setErrorMessage(null);
                }}
              />
            )}

            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.placeholderText}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {isAdmin && (
              <FileUpload
                initialFiles={uploadedUrls}
                onChange={(urls) => {
                  const prev = prevUrlsRef.current;
                  const added = urls.filter((u) => !prev.includes(u));
                  const removed = prev.filter((u) => !urls.includes(u));

                  // Track new uploads
                  if (added.length > 0) {
                    setNewFiles((prevNew) => [
                      ...new Set([
                        ...prevNew,
                        ...added.filter((u) => !initialFiles.includes(u)),
                      ]),
                    ]);
                  }

                  // Track new files that were later removed
                  if (removed.length > 0) {
                    const removedWereNew = removed.filter(
                      (u) => !initialFiles.includes(u) && newFiles.includes(u)
                    );
                    if (removedWereNew.length > 0) {
                      setRemovedNewFiles((prevRem) => [
                        ...new Set([...prevRem, ...removedWereNew]),
                      ]);
                      setNewFiles((prevNew) =>
                        prevNew.filter((u) => !removedWereNew.includes(u))
                      );
                    }
                  }

                  setUploadedUrls(urls);
                  prevUrlsRef.current = urls;
                }}
                editable={isAdmin || user?.userId === resource.uploaded_by}
              />
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.button, styles.buttonGhost]}
                disabled={submitting}
              >
                <Text style={styles.buttonGhostText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApprove}
                style={styles.button}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting ? "Approving..." : "Approve"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
