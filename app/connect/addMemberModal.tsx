// connect/AddMemberModal.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Dimensions,
  TextInput,
} from "react-native";
import Modal from "react-native-modal";
import { supabase } from "../../lib/supabaseClient";
import { useAppDispatch } from "../../store/hooks/hooks";
import { inviteUserToGroup } from "../../store/slices/groupsSlice";

// 🔥 Reuse your profile dropdown styles
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
  existingMemberIds: string[];
}

export default function AddMemberModal({
  visible,
  onClose,
  groupId,
  existingMemberIds,
}: Props) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filtered, setFiltered] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const { height } = Dimensions.get("window");

  /* Load ALL users when modal opens */
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

      const cleaned = (data ?? []).filter(
        (u) => !existingMemberIds.includes(u.id)
      );

      setUsers(cleaned);
      setFiltered(cleaned);
      setSelected([]);
      setSearch("");

      setOpen(true);
    };

    load();
  }, [visible]);

  /* Search Filter */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter((u) => u.name?.toLowerCase().includes(q))
    );
  }, [search, users]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleClear = () => setSelected([]);

  const handleDone = async () => {
    for (const userId of selected) {
      await dispatch(inviteUserToGroup({ groupId, userId, role: "member" }));
    }
    setOpen(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      isVisible={open}
      onBackdropPress={() => {
        setOpen(false);
        onClose();
      }}
      backdropColor={colors.modalBackdrop}
      backdropOpacity={0.8}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
      style={styles.dropdownModal}
    >
      <View
        style={[
          styles.dropdownList,
          { maxHeight: Math.min(height * 0.75, 480) },
        ]}
      >
        {/* 🔍 SEARCH BAR */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={{
              backgroundColor: "#1c1c1e",
              color: "#fff",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#333",
            }}
          />
        </View>

        {/* USER LIST */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                style={[
                  styles.dropdownItem,
                  isSelected && styles.dropdownItemSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    isSelected && styles.dropdownItemTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={() => (
            <Text
              style={{
                color: "#999",
                padding: 20,
                textAlign: "center",
                fontSize: 16,
              }}
            >
              No users found
            </Text>
          )}
        />

        {/* FOOTER BUTTONS */}
        <View style={styles.dropdownFooter}>
          <TouchableOpacity
            onPress={handleClear}
            style={[styles.dropdownFooterButton, styles.dropdownFooterClear]}
          >
            <Text style={styles.dropdownFooterClearText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDone}
            disabled={selected.length === 0}
            style={[
              styles.dropdownFooterButton,
              styles.dropdownFooterDone,
              selected.length === 0 && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.dropdownFooterDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
