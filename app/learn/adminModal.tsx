// learn/adminModal.tsx
import React, { useMemo, useState } from "react";
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
  Image,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";
import { useAppDispatch } from "../../store/hooks";
import { fetchResources } from "../../store/slices/resourcesSlice";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import ResourceTagDropdown from "./tagDropdown";
import ResourceTierDropdown from "./tierDropdown";
import { FileText } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import type { Resource } from "../../store/slices/resourcesSlice";
import { useUser } from "../../app/userContext";

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

  const handleCancel = () => {
    setTitle(resource.title ?? "");
    setDescription(resource.description ?? "");
    setTags(resource.tags ?? []);
    setTier(resource.tier_access ?? null);
    setUploadedUrls(initialFiles);
    setErrorMessage(null);
    onClose();
  };

  const handleApprove = async () => {
    if (isAdmin && !tier) {
      setErrorMessage("Missing Tier");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const { error } = await supabase
        .from("resources")
        .update({
          title: title.trim(),
          description: description?.trim() || null,
          tags,
          tier_access: tier,
          is_approved: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resource.id);

      if (error) throw error;

      await dispatch(fetchResources()).unwrap();
      onClose();
    } catch (err) {
      console.error("Approve error:", err);
      Alert.alert("Error", "Failed to approve resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const openFile = async (url: string) => {
    try {
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch {
      Alert.alert("Error", "Failed to open file.");
    }
  };

  if (!visible) return null;

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

            {uploadedUrls.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {uploadedUrls.map((url, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => openFile(url)}
                    activeOpacity={0.8}
                    style={styles.adminPreviewCard}
                  >
                    {/\.(png|jpe?g|gif|webp)$/i.test(url) ? (
                      <Image source={{ uri: url }} style={styles.modalPreviewImage} />
                    ) : (
                      <FileText
                        size={32}
                        color={colors.link}
                        style={styles.filePreviewIcon}
                      />
                    )}
                    <Text numberOfLines={1} style={styles.filePreviewName}>
                      {decodeURIComponent(url.split("/").pop() ?? "File").replace(
                        /^\d+_/,
                        ""
                      )}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
