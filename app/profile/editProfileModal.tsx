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
import { useRouter } from "expo-router";
import { profileStyles as styles } from "../../styles/profileStyles";
import AvatarManager from "./avatarManager";
import ProfileTypeDropdown from "./dropdowns/profileTypeDropdown";
import type { Profile } from "../../store/slices/profileSlice";
import { useAppDispatch } from "../../store/hooks/hooks";
import { uploadAvatar, updateProfile } from "../../store/slices/profileSlice";
import ExpertiseDropdown from "./dropdowns/expertiseDropdown";
import NeedsDropdown from "./dropdowns/needsDropdown";
import AssetTypesDropdown from "./dropdowns/assetTypesDropdown";
import MarketsDropdown from "./dropdowns/marketsDropdown";
import { useUser } from "../../app/userContext";
import { signOut } from "../../store/slices/authSlice";
import { deleteAccount } from "../../utils/deleteAccount";

interface EditProfileModalProps {
  visible: boolean;
  profile: Profile | null;
  userId: string | null;
  authUser: any;
  name: string;
  type: string | null;
  setName: (v: string) => void;
  setType: (v: string | null) => void;
  onClose: () => void;
}

export default function EditProfileModal({
  visible,
  profile,
  userId,
  authUser,
  name,
  type,
  setName,
  setType,
  onClose,
}: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { roles } = useUser();
  const isPlacemaker = roles.includes("placemaker") || roles.includes("admin");

  const [expertise, setExpertise] = useState<string[]>(profile?.expertise ?? []);
  const [needs, setNeeds] = useState<string[]>(profile?.needs ?? []);
  const [assetTypes, setAssetTypes] = useState<string[]>(profile?.asset_types ?? []);
  const [markets, setMarkets] = useState<string[]>(profile?.markets ?? []);

  useEffect(() => {
    if (visible && profile) {
      setTempAvatarUri(profile.avatar_url ?? null);
      setName(profile.name ?? "");
      setType(profile.profile_type ?? null);
      setExpertise(profile.expertise ?? []);
      setNeeds(profile.needs ?? []);
      setAssetTypes(profile.asset_types ?? []);
      setMarkets(profile.markets ?? []);
    }
  }, [visible, profile, setName, setType]);

  const handleCancel = () => {
    if (profile) {
      setTempAvatarUri(profile.avatar_url ?? null);
      setName(profile.name ?? "");
      setType(profile.profile_type ?? null);
      setExpertise(profile.expertise ?? []);
      setNeeds(profile.needs ?? []);
      setAssetTypes(profile.asset_types ?? []);
      setMarkets(profile.markets ?? []);
    }
    onClose();
  };

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      if (tempAvatarUri && tempAvatarUri !== profile?.avatar_url) {
        await dispatch(uploadAvatar({ userId, fileUri: tempAvatarUri })).unwrap();
      }

      await dispatch(
        updateProfile({
          id: userId,
          name,
          profile_type: type,
          expertise,
          needs,
          asset_types: assetTypes,
          markets,
        })
      ).unwrap();

      onClose();
    } catch (err) {
      console.warn("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setIsDeleting(true);
    try {
      await deleteAccount(userId);
      await dispatch(signOut());
      router.replace("/login");
    } catch (err) {
      console.error("Account deletion failed:", err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={showDeleteConfirm ? () => !isDeleting && setShowDeleteConfirm(false) : handleCancel}>
      <Pressable
        style={styles.modalBackdrop}
        onPress={showDeleteConfirm ? () => !isDeleting && setShowDeleteConfirm(false) : handleCancel}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalCardWrap}
      >
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1, justifyContent: "center" }]}
          keyboardShouldPersistTaps="handled"
        >
          {showDeleteConfirm ? (
            <View style={[styles.modalCard, { borderColor: "#ff4d4f" }]}>
              <Text style={[styles.modalTitle, { color: "#ff4d4f" }]}>Delete Account?</Text>
              <Text style={{ color: "#ccc", textAlign: "center", lineHeight: 20, fontSize: 16 }}>
                This will permanently delete your account, messages, and all uploaded files. This cannot be undone.
              </Text>
              <View style={[styles.center, styles.buttonRow]}>
                <TouchableOpacity
                  onPress={() => setShowDeleteConfirm(false)}
                  style={[styles.button, styles.buttonGhost]}
                  disabled={isDeleting}
                >
                  <Text style={styles.buttonGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  style={[
                    styles.button,
                    { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" },
                    isDeleting && { opacity: 0.6 },
                  ]}
                  disabled={isDeleting}
                >
                  <Text style={styles.buttonText}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.modalCard}>
              {/* Delete Account */}
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(true)}
                style={{ alignSelf: "flex-end", paddingBottom: 12 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ color: "#ff4d4f", fontSize: 18, fontWeight: "600" }}>
                  Delete Account
                </Text>
              </TouchableOpacity>

              <AvatarManager
                profile={profile}
                userId={userId}
                authUser={authUser}
                inModal
                tempUri={tempAvatarUri}
                setTempUri={setTempAvatarUri}
              />

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor="#A0A0A0"
                returnKeyType="done"
              />

              <ProfileTypeDropdown value={type} onSelect={setType} />

              {isPlacemaker && (
                <>
                  <Text style={styles.modalLabel}>Expertise</Text>
                  <ExpertiseDropdown value={expertise} onChange={setExpertise} />
                  <Text style={styles.modalLabel}>Asset Types</Text>
                  <AssetTypesDropdown value={assetTypes} onChange={setAssetTypes} />
                  <Text style={styles.modalLabel}>Markets</Text>
                  <MarketsDropdown value={markets} onChange={setMarkets} />
                  <Text style={styles.modalLabel}>Needs</Text>
                  <NeedsDropdown value={needs} onChange={setNeeds} />
                </>
              )}

              <View style={[styles.center, styles.buttonRow]}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.button, styles.buttonGhost]}
                >
                  <Text style={styles.buttonGhostText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.button, styles.buttonPrimary, isSaving && { opacity: 0.6 }]}
                  disabled={isSaving}
                >
                  <Text style={styles.buttonText}>
                    {isSaving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
