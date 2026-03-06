// connect/addMemberModal.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabaseClient";
import { useAppDispatch } from "../../store/hooks/hooks";
import {
  inviteUserToGroup,
  removeGroupMember,
  fetchGroupMembers,
  GroupMember,
} from "../../store/slices/groupsSlice";
import { profileStyles as styles, colors } from "../../styles/profileStyles";

interface UserRow {
  id: string;
  name: string;
  roles: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  existingMembers: GroupMember[];
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  leader: "Leader",
  member: "Member",
};

export default function AddMemberModal({
  visible,
  onClose,
  groupId,
  existingMembers,
}: Props) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filtered, setFiltered] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef<TextInput>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { height } = Dimensions.get("window");
  const cardMaxHeight = Math.min(height * 0.75, 560);
  const cardTopPad = Math.max(0, (height - cardMaxHeight) / 2);

  const existingMemberIds = existingMembers.map((m) => m.user_id);

  useEffect(() => {
    if (!visible) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, roles")
        .order("name");

      if (error) {
        console.error("Error loading users:", error);
        return;
      }

      const all = data ?? [];

      const members = all.filter((u) => existingMemberIds.includes(u.id));
      const nonMembers = all.filter((u) => !existingMemberIds.includes(u.id));
      const sorted = [...members, ...nonMembers];

      setUsers(sorted);
      setFiltered(sorted);
      setSelected([...existingMemberIds]);
      setSearch("");

      setOpen(true);
    };

    load();
  }, [visible]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter((u) => u.name?.toLowerCase().includes(q)));
  }, [search, users]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCancel = () => {
    setOpen(false);
    onClose();
  };

  const handleSave = async () => {
    const toAdd = selected.filter((id) => !existingMemberIds.includes(id));
    const toRemove = existingMemberIds.filter((id) => !selected.includes(id));

    setIsSaving(true);
    try {
      const results = await Promise.all([
        ...toAdd.map((userId) =>
          dispatch(inviteUserToGroup({ groupId, userId, role: "member" }))
        ),
        ...toRemove.map((userId) =>
          dispatch(removeGroupMember({ groupId, userId }))
        ),
      ]);

      const failed = results.filter((r) => (r as any).error);
      if (failed.length) {
        Alert.alert("Error", "Some members could not be updated. Check permissions and try again.");
        return;
      }

      await dispatch(fetchGroupMembers(groupId));
    } finally {
      setIsSaving(false);
      setOpen(false);
      onClose();
    }
  };

  const hasChanges =
    selected.some((id) => !existingMemberIds.includes(id)) ||
    existingMemberIds.some((id) => !selected.includes(id));

  if (!visible) return null;

  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={() => {}}
    >
      {/* Backdrop — sibling to content so web clicks don't bubble into it */}
      <View
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.75)",
        }}
      />
      {/* Centering wrapper — box-none so empty-area taps reach the backdrop */}
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-start", paddingTop: cardTopPad, alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.dropdownList,
            { maxHeight: cardMaxHeight },
          ]}
        >
          <View style={[styles.searchRow, { paddingTop: 12 }]}>
            <Pressable
              style={[styles.search, { flexDirection: "row", alignItems: "center" }]}
              onPress={() => searchRef.current?.focus()}
            >
              <Ionicons name="search" size={18} color={colors.placeholderText} style={{ marginRight: 8 }} />
              <TextInput
                ref={searchRef}
                value={search}
                onChangeText={setSearch}
                placeholder="Search Users"
                placeholderTextColor={colors.placeholderText}
                selectionColor={colors.placeholderText}
                keyboardAppearance="dark"
                autoCapitalize="none"
                style={[
                  { flex: 1, color: colors.textPrimary, fontSize: 16, alignSelf: "stretch" },
                  Platform.OS === "web" && { outlineStyle: "none" } as any,
                ]}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons name="close" size={20} color={colors.placeholderText} />
                </Pressable>
              )}
            </Pressable>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const membership = existingMembers.find((m) => m.user_id === item.id);
              const isExisting = !!membership;
              const isSelected = selected.includes(item.id);
              return (
                <Pressable
                  onPress={() => toggle(item.id)}
                  style={[
                    styles.dropdownItem,
                    isSelected && styles.dropdownItemSelected,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isExisting && isSelected && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.accent,
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        {ROLE_LABEL[membership.role] ?? "Member"}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={() => (
              <Text
                style={{
                  color: "#999",
                  padding: 20,
                  textAlign: "center",
                  fontSize: 20,
                }}
              >
                No Users Found
              </Text>
            )}
          />

          <View style={styles.dropdownFooter}>
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isSaving}
              style={[
                styles.dropdownFooterButton,
                styles.dropdownFooterClear,
                {
                  borderWidth: 2,
                  borderColor: "#ff4d4f",   // strong red
                },
                isSaving && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.dropdownFooterClearText,
                  { color: "#ff4d4f", fontWeight: "600" },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
              style={[
                styles.dropdownFooterButton,
                styles.dropdownFooterDone,
                (!hasChanges || isSaving) && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.dropdownFooterDoneText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
