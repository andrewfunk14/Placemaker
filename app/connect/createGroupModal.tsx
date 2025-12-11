// connect/createGroupModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { connectStyles as styles, colors } from "../../styles/connectStyles";
import { useAppDispatch } from "../../store/hooks/hooks";
import { createGroup } from "../../store/slices/groupsSlice";
import { supabase } from "../../lib/supabaseClient";
import { ChevronDown, ChevronUp } from "lucide-react-native";

interface SimpleUser {
  id: string;
  name: string;
  roles: string[];
}

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({
  visible,
  onClose,
}: CreateGroupModalProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const paidRolesLc = [
    "placemaker",
    "dealmaker",
    "changemaker",
    "policymaker",
    "admin",
  ];

  useEffect(() => {
    if (!visible) return;

    const loadUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, roles")
        .order("name");

      if (error) {
        console.error(error);
        return;
      }

      const cleaned =
        data
          ?.map((u: any) => {
            let roles: string[] = [];

            if (Array.isArray(u.roles)) {
              roles = u.roles;
            } else if (typeof u.roles === "string") {
              roles = u.roles.split(/[, ]+/);
            }

            const rolesLc = roles.map((r) => r.toLowerCase());
            const isPaid = rolesLc.some((r) => paidRolesLc.includes(r));

            return {
              id: u.id,
              name: u.name ?? "Unnamed User",
              roles: rolesLc,
              isPaid,
            };
          })
          .filter((u) => u.isPaid) ?? [];

      setUsers(cleaned);
    };

    loadUsers();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setName("");
      setLeaderId(null);
      setShowDropdown(false);
    }
  }, [visible]);

  const handleSelectLeader = (user: SimpleUser) => {
    setLeaderId(user.id);
    setShowDropdown(false);
  };

  const handleCreate = async () => {
    if (!name || !leaderId) return;

    try {
      await dispatch(createGroup({ name, leaderId })).unwrap();
    } catch (e) {
      console.error("Create failed:", e);
    }

    onClose();
  };

  const selectedLeaderName =
    leaderId && users.find((u) => u.id === leaderId)?.name;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Create Group</Text>

          <TextInput
            placeholder="Group Name"
            placeholderTextColor={colors.placeholderText}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDropdown((s) => !s)}
            >
              <Text
                style={[
                  styles.dropdownValue,
                  !selectedLeaderName && styles.dropdownPlaceholder,
                ]}
              >
                {selectedLeaderName || "Select Group Leader"}
              </Text>

              {showDropdown ? (
                <ChevronUp size={20} color={colors.placeholderText} />
              ) : (
                <ChevronDown size={20} color={colors.placeholderText} />
              )}
            </TouchableOpacity>

            {showDropdown && (
              <View
                style={styles.dropdownPanel}
                pointerEvents="box-none"
              >
                <ScrollView
                  style={styles.dropdownList}
                  keyboardShouldPersistTaps="handled"
                >
                  {users.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      style={styles.userRow}
                      onPress={() => handleSelectLeader(u)}
                    >
                      <Text style={styles.userName}>{u.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonGhost]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.buttonGhostText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleCreate}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
