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
import ProfileTypeDropdown from "./dropdowns/profileTypeDropdown";
import type { Profile } from "../../store/slices/profileSlice";
import { useAppDispatch } from "../../store/hooks";
import { uploadAvatar, updateProfile } from "../../store/slices/profileSlice";
import ExpertiseDropdown from "./dropdowns/expertiseDropdown";
import NeedsDropdown from "./dropdowns/needsDropdown";
import AssetTypesDropdown from "./dropdowns/assetTypesDropdown";
import MarketsDropdown from "./dropdowns/marketsDropdown";
import { useUser } from "../../app/userContext";

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
}: EditProfileModalProps) {
  const dispatch = useAppDispatch();

  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);
  
  const { roles } = useUser();
  const isPlacemaker = roles.includes("placemaker") || roles.includes("admin");

  const [expertise, setExpertise] = useState<string[]>(profile?.expertise ?? []);
  const [needs, setNeeds] = useState<string[]>(profile?.needs ?? []);
  const [assetTypes, setAssetTypes] = useState<string[]>(profile?.asset_types ?? []);
  const [markets, setMarkets] = useState<string[]>(profile?.markets ?? []);

  // 👇 Whenever the modal opens, reset all fields to the latest profile data
  useEffect(() => {
    if (visible && profile) {
      setTempAvatarUri(profile.avatar_url ?? null);
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setType(profile.profile_type ?? null);
      setExpertise(profile.expertise ?? []);
      setNeeds(profile.needs ?? []);
      setAssetTypes(profile.asset_types ?? []);
      setMarkets(profile.markets ?? []);
    }
  }, [visible, profile, setName, setBio, setType]);

  // ❌ Cancel handler: discard changes & revert to saved values
  const handleCancel = () => {
    if (profile) {
      setTempAvatarUri(profile.avatar_url ?? null);
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setType(profile.profile_type ?? null);
      setExpertise(profile.expertise ?? []);
      setNeeds(profile.needs ?? []);
      setAssetTypes(profile.asset_types ?? []);
      setMarkets(profile.markets ?? []);
    }
    onClose();
  };

  // 💾 Save handler: upload avatar (if changed) and run onSave()
  const handleSave = async () => {
    if (!userId) return;
  
    try {
      if (tempAvatarUri && tempAvatarUri !== profile?.avatar_url) {
        await dispatch(uploadAvatar({ userId, fileUri: tempAvatarUri })).unwrap();
      }
  
      await dispatch(
        updateProfile({
          id: userId,
          name,
          bio,
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
    }
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
