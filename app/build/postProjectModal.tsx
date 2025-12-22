// components/build/postProjectModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { ProjectStatus } from "../../store/slices/projectsSlice";
import { buildStyles as styles } from "../../styles/buildStyles";

const STATUSES: ProjectStatus[] = ["idea", "in progress", "completed"];

export type ProjectFormValues = {
  title: string;
  description?: string;
  location?: string;
  status: ProjectStatus;
};

interface PostProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormValues) => Promise<void>;
}

export default function PostProjectModal({
  visible,
  onClose,
  onSubmit,
}: PostProjectModalProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("idea");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setDescription("");
    setStatus("idea");
    setError(null);
  };

  const handlePost = async () => {
    if (!title.trim()) {
      setError("Please add a project title.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        status,
      });

      setSubmitting(false);
      resetForm();
      onClose();
    } catch (e: any) {
      setSubmitting(false);
      setError(e?.message || "Something went wrong while creating the project.");
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardTitle}>Share a project</Text>

            <TextInput
              placeholder="Project title"
              placeholderTextColor={styles.placeholderColor?.color || "#a0a0a0"}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              placeholder="Location"
              placeholderTextColor={styles.placeholderColor?.color || "#a0a0a0"}
              style={styles.input}
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {STATUSES.map((s) => {
                const selected = s === status;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[
                      styles.statusOption,
                      selected && styles.statusOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        selected && styles.statusOptionTextSelected,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              placeholder="Description"
              placeholderTextColor={styles.placeholderColor?.color || "#a0a0a0"}
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              onPress={handlePost}
              disabled={submitting}
              style={[styles.button, submitting && styles.buttonDisabled]}
            >
              {submitting ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.buttonText}>Post</Text>
              )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
