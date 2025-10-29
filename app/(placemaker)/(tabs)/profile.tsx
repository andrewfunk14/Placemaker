// (placemaker)/(tabs)/profile.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProfile, updateProfile } from "../../../store/slices/profileSlice";
import { useUser, type UserRole } from "../../userContext";
import { profileStyles as styles, colors } from "../../../styles/profileStyles";
import AvatarManager from "../../profile/avatarManager";
import RoleBadge from "../../profile/roleBadge";
import EditProfileModal from "../../profile/editProfileModal";
import { Pencil } from "lucide-react-native";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const { userId: ctxUserId, roles: ctxRoles } = useUser();
  const { profile, loading } = useAppSelector((s) => s.profile);

  const userId = authUser?.id ?? ctxUserId ?? null;

  const displayRoles: UserRole[] = useMemo(() => {
    const allRoles = (authUser?.roles ?? ctxRoles ?? ["free"]) as UserRole[];
    const unique = Array.from(new Set(allRoles));
    const hasOtherRoles = unique.some((r) => r !== "free");
    return hasOtherRoles ? unique.filter((r) => r !== "free") : ["free"];
  }, [authUser?.roles, ctxRoles]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editType, setEditType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // load profile
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchProfile(userId))
      .unwrap()
      .then((p) => {
        setEditName(p?.name ?? "");
        setEditBio(p?.bio ?? "");
        setEditType(p?.profile_type ?? null);
      })
      .catch(console.error);
  }, [dispatch, userId]);

  // save handler
  const handleSave = useCallback(async () => {
    if (!userId) return;
    try {
      setSaving(true);
      await dispatch(
        updateProfile({
          id: userId,
          name: editName.trim(),
          bio: editBio.trim(),
          profile_type: editType,
        })
      ).unwrap();
      setEditModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert("Save Failed", msg ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  }, [dispatch, userId, editName, editBio, editType]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundMid }}>
      <ScrollView
        key={authUser?.id ?? "guest"}
        contentContainerStyle={styles.container}
        style={{ backgroundColor: colors.backgroundMid }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>

          <TouchableOpacity
            onPress={() => setEditModalOpen(true)}
            style={styles.editTopRightBtn}
            activeOpacity={0.7}
          >
            <Pencil color={colors.accent} size={32} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            {/* Avatar */}
            <AvatarManager profile={profile} userId={userId} authUser={authUser} />

              {/* Right info block */}
              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <Text style={styles.title}>
                    {profile?.name || authUser?.name || ""}
                  </Text>
                </View>

                {profile?.profile_type?.trim() ? (
                  <Text style={styles.subtitle}>{profile.profile_type}</Text>
                ) : null}

                {/* Show badges only on web inside header */}
                {Platform.OS === "web" && (
                  <View style={styles.badgeRow}>
                    {displayRoles.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </View>
                )}
              </View>

            {/* On mobile, badges show BELOW the header */}
            {Platform.OS !== "web" && (
              <View style={styles.badgeRowMobile}>
                {displayRoles.map((r) => (
                  <RoleBadge key={r} role={r} />
                ))}
              </View>
            )}
            </View>
          </View>

        {/* EDIT MODAL */}
        <EditProfileModal
          visible={editModalOpen}
          profile={profile}
          userId={userId}
          authUser={authUser}
          name={editName}
          bio={editBio}
          type={editType}
          saving={saving}
          setName={setEditName}
          setBio={setEditBio}
          setType={setEditType}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSave}
        />
      </ScrollView>
    </View>
  );
}
