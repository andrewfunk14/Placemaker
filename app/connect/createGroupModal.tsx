// connect/createGroupModal.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { connectStyles as styles, colors } from "../../styles/connectStyles";
import { useAppDispatch } from "../../store/hooks/hooks";
import { createGroup } from "../../store/slices/groupsSlice";
import { supabase } from "../../lib/supabaseClient";

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
  const [leaderSearch, setLeaderSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const leaderSearchRef = useRef<TextInput>(null);

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
      setLeaderSearch("");
    }
  }, [visible]);

  const selectedLeaderName = leaderId
    ? users.find((u) => u.id === leaderId)?.name
    : null;

  const suggestions = useMemo(() => {
    if (leaderId || !leaderSearch.trim()) return [];
    const q = leaderSearch.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 5);
  }, [users, leaderSearch, leaderId]);

  const handleLeaderChange = (text: string) => {
    if (leaderId) setLeaderId(null);
    setLeaderSearch(text);
  };

  const handleSelectLeader = (user: SimpleUser) => {
    setLeaderId(user.id);
    setLeaderSearch("");
  };

  const handleCreate = async () => {
    if (!name || !leaderId) return;

    setIsCreating(true);
    try {
      await dispatch(createGroup({ name, leaderId })).unwrap();
    } catch (e) {
      console.error("Create failed:", e);
    } finally {
      setIsCreating(false);
      onClose();
    }
  };

  const showSuggestions = suggestions.length > 0;

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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

          <Pressable
            style={[
              styles.input,
              { flexDirection: "row", alignItems: "center" },
              showSuggestions && { marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
            ]}
            onPress={() => leaderSearchRef.current?.focus()}
          >
            <Ionicons name="search" size={18} color={colors.placeholderText} style={{ marginRight: 8 }} />
            <TextInput
              ref={leaderSearchRef}
              value={selectedLeaderName ?? leaderSearch}
              onChangeText={handleLeaderChange}
              placeholder="Group Leader"
              placeholderTextColor={colors.placeholderText}
              keyboardAppearance="dark"
              autoCapitalize="none"
              style={[
                { flex: 1, color: colors.textPrimary, fontSize: 18, alignSelf: "stretch" },
                Platform.OS === "web" && { outlineStyle: "none" } as any,
              ]}
            />
            {(selectedLeaderName || leaderSearch.length > 0) && (
              <Pressable onPress={() => { setLeaderId(null); setLeaderSearch(""); }} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.placeholderText} />
              </Pressable>
            )}
          </Pressable>

          {showSuggestions && (
            <View
              style={{
                borderWidth: 1,
                borderTopWidth: 0,
                borderColor: "gray",
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                backgroundColor: colors.backgroundMid,
                marginBottom: 16,
                overflow: "hidden",
              }}
            >
              {suggestions.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.userRow}
                  onPress={() => handleSelectLeader(u)}
                >
                  <Text style={styles.userName}>{u.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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
              style={[styles.button, styles.buttonPrimary, isCreating && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={isCreating}
            >
              <Text style={styles.buttonText}>
                {isCreating ? "Creating..." : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
