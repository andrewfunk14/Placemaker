// build/postProjectModal.tsx
import React, { useState, useRef, } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ProjectStatus } from "../../store/slices/projectsSlice";
import { buildStyles as styles } from "../../styles/buildStyles";
import ProjectFileUpload from "./projectFileUpload";

const STATUSES: ProjectStatus[] = ["idea", "in progress", "completed"];

const STATUS_COLORS: Record<ProjectStatus, string> = {
    idea: "#3B82F6",
    "in progress": "#FBBF24",
    completed: "#22C55E",
  };

export type ProjectFormValues = {
  title: string;
  description?: string;
  location?: string;
  status: ProjectStatus;
  files?: string[];
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
  const [files, setFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setDescription("");
    setStatus("idea");
    setFiles([]);
    setError(null);
  };

  const handlePost = async () => {
    if (submitting) return;

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
        files: files.length ? files : undefined,
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
    if (!submitting) onClose();
  };

  const formatStatusLabel = (status: ProjectStatus) => {
    if (status === "in progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const locationRef = useRef<TextInput>(null);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <Pressable
        style={[
          styles.modalBackdrop,
          submitting && { backgroundColor: "rgba(0,0,0,0.6)" },
        ]}
        disabled={submitting}
        onPress={handleClose}
      />
  
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalCardWrap}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalScrollContent}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <Text style={styles.modalTitle}>New Project</Text>
  
            {/* Title */}
            <TextInput
              placeholder="Title"
              placeholderTextColor="#a0a0a0"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              onSubmitEditing={() => locationRef.current?.focus()}
            />
  
            {/* Location */}
            <TextInput
              ref={locationRef}
              placeholder="Location"
              placeholderTextColor="#a0a0a0"
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              returnKeyType="done"
            />
  
            {/* Status */}
            <View style={styles.modalStatusRow}>
                {STATUSES.map((s) => {
                    const selected = s === status;
                    const color =
                    STATUS_COLORS[s as ProjectStatus] ?? "#9CA3AF";

                    return (
                    <TouchableOpacity
                        key={s}
                        onPress={() => setStatus(s)}
                        style={[
                        styles.statusOption,
                        {
                            borderColor: selected
                            ? `${color}55`
                            : styles.statusOption.borderColor,
                            backgroundColor: selected
                            ? `${color}20`
                            : "transparent",
                        },
                        ]}
                    >
                        <Text
                        style={[
                            styles.statusOptionText,
                            selected && {
                            color,
                            fontWeight: "600",
                            },
                        ]}
                        >
                        {formatStatusLabel(s)}
                        </Text>
                    </TouchableOpacity>
                    );
                })}
            </View>

  
            {/* Description */}
            <TextInput
              placeholder="Caption (optional)"
              placeholderTextColor="#a0a0a0"
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              multiline
            />
  
            {/* Files */}
            <View style={{ marginTop: 8 }}>
              <ProjectFileUpload
                initialFiles={files}
                onChange={setFiles}
                editable={!submitting}
              />
            </View>
  
            {/* Footer buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.button, styles.buttonGhost]}
                disabled={submitting}
              >
                <Text style={styles.buttonGhostText}>Cancel</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                onPress={handlePost}
                style={[
                  styles.button,
                  submitting && styles.buttonDisabled,
                ]}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting ? "Submitting…" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );  
}
