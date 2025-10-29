// profile/EditProfileModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { profileStyles as styles } from "../../styles/profileStyles";
import AvatarManager from "./avatarManager";
import ProfileTypeDropdown from "./profileTypeDropdown";
import type { Profile } from "../../store/slices/profileSlice";
import { useAppDispatch } from "../../store/hooks";
import { uploadAvatar } from "../../store/slices/profileSlice";

interface EditProfileModalProps {
  visible: boolean;
  profile: Profile | null;
  userId: string | null;
  authUser: any;
  name: string;
  bio: string;
  type: string | null;
  saving: boolean;
  setName: (v: string) => void;
  setBio: (v: string) => void;
  setType: (v: string | null) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProfileModal({
  visible,
  profile,
  userId,
  authUser,
  name,
  bio,
  type,
  saving,
  setName,
  setBio,
  setType,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const dispatch = useAppDispatch();

  // 🖼️ local temporary avatar (only stored for this modal session)
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);

  // 👇 Whenever the modal opens, reset all fields to the latest profile data
  useEffect(() => {
    if (visible && profile) {
      setTempAvatarUri(profile.avatar_url ?? null);
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setType(profile.profile_type ?? null);
    }
  }, [visible, profile, setName, setBio, setType]);

  // ❌ Cancel handler: discard changes & revert to saved values
  const handleCancel = () => {
    if (profile) {
      setTempAvatarUri(profile.avatar_url ?? null);
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setType(profile.profile_type ?? null);
    }
    onClose();
  };

  // 💾 Save handler: upload avatar (if changed) and run onSave()
  const handleSave = async () => {
    if (!userId) {
      onSave();
      return;
    }

    if (tempAvatarUri && tempAvatarUri !== profile?.avatar_url) {
      try {
        await dispatch(uploadAvatar({ userId, fileUri: tempAvatarUri })).unwrap();
      } catch (err) {
        console.warn("Avatar upload failed:", err);
      }
    }

    onSave();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleCancel}>
      {/* Backdrop click to close */}
      <Pressable style={styles.modalBackdrop} onPress={handleCancel} />

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalCardWrap}
        >
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1, justifyContent: "center" }]}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.modalCard}>
          {/* Avatar Manager (now works seamlessly with cancel/reset) */}
          <AvatarManager
            profile={profile}
            userId={userId}
            authUser={authUser}
            inModal
            tempUri={tempAvatarUri}
            setTempUri={setTempAvatarUri}
          />

          {/* Name field */}
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#A0A0A0"
            returnKeyType="done"
          />

          {/* Profile Type Dropdown */}
          <ProfileTypeDropdown value={type} onSelect={setType} />

          {/* Action buttons */}
          <View style={[styles.center, styles.buttonRow]}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.button, styles.buttonGhost]}
            >
              <Text style={styles.buttonGhostText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.button, styles.buttonPrimary]}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
