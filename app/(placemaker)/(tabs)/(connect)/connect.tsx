// (placemaker)/(tabs)/connect/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  fetchMyGroups,
  fetchGroupMembers,
} from "../../../../store/slices/groupsSlice";
import { colors, connectStyles as styles } from "../../../../styles/connectStyles";
import CreateGroupModal from "../../../connect/createGroupModal";
import GroupChat from "../../../connect/groupChat";
import { useUser } from "../../../userContext";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import AddMemberModal from "../../../connect/addMemberModal";

export default function ConnectScreen() {
  const dispatch = useAppDispatch();

  const authUser = useAppSelector((s) => s.auth.user);
  const { userId: ctxUserId, roles: ctxRoles } = useUser();

  const userId = authUser?.id ?? ctxUserId ?? null;
  const roles = authUser?.roles ?? ctxRoles ?? [];

  const { groups, loading } = useAppSelector((s) => s.groups);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberGroup, setAddMemberGroup] = useState<any | null>(null);
  const membersByGroupId = useAppSelector((s) => s.groups.membersByGroupId);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = roles.includes("admin");
  const isPlacemakerPaid = roles.some((r) =>
    ["placemaker", "dealmaker", "changemaker", "policymaker"].includes(r)
  );

  /* INITIAL LOAD */
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchMyGroups({ userId, roles }));
  }, [userId, roles, dispatch]);

  /* REFRESH ON FOCUS */
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      dispatch(fetchMyGroups({ userId, roles }));
    }, [userId, roles])
  );

  /* LOAD MEMBERS WHEN GROUPS CHANGE */
  useEffect(() => {
    groups.forEach((g) => dispatch(fetchGroupMembers(g.id)));
  }, [groups, dispatch]);

  const toggleGroup = (id: string) =>
    setSelectedGroupId((cur) => (cur === id ? null : id));

  return (
    <View style={styles.container}>
      {isPlacemakerPaid && (
        <View style={styles.matchmakingCard}>
          <View style={styles.matchmakingTextCol}>
            <Text style={styles.matchmakingTitle}>1:1 Matchmaking</Text>
            <Text style={styles.matchmakingSubtitle}>
              Monthly curated introductions for Placemaker members.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.matchmakingButton}
            onPress={() => console.log("View Matches tapped")}
          >
            <Text style={styles.matchmakingButtonText}>View Matches</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* GROUP LIST */}
      <ScrollView
        style={styles.groupsListScroll}
        contentContainerStyle={styles.groupsListContent}
      >
        {loading && <Text style={styles.loadingText}>Loading groups...</Text>}

        {!loading && groups.length === 0 && (
          <Text style={styles.emptyText}>No groups yet.</Text>
        )}

        {groups.map((g) => {
          const isOpen = selectedGroupId === g.id;
          return (
            <View key={g.id} style={styles.groupCard}>
              <View style={styles.groupCardHeader}>
                {/* LEFT: title + chevron (one big touchable) */}
                <TouchableOpacity
                  style={styles.headerMainTouchable}
                  onPress={() => toggleGroup(g.id)}
                >
                  <Text style={styles.groupCardTitle}>{g.name}</Text>

                  {isOpen ? (
                    <ChevronUp size={22} color={colors.textPrimary} />
                  ) : (
                    <ChevronDown size={22} color={colors.textPrimary} />
                  )}
                </TouchableOpacity>

                {/* RIGHT: small + button */}
                {(isAdmin || g.leader_id === userId) && (
                  <TouchableOpacity
                    style={styles.headerSmallFab}
                    onPress={() => {
                      setAddMemberGroup(g);
                      setShowAddMemberModal(true);
                    }}
                  >
                    <Text style={styles.headerSmallFabText}>＋</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isOpen && (
                <View style={styles.groupCardChat}>                  
                  <GroupChat groupId={g.id} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ADD GROUP BUTTON */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      )}

      {/* MODAL */}
      {isAdmin && (
        <CreateGroupModal
          visible={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            if (userId) dispatch(fetchMyGroups({ userId, roles }));
          }}
        />
      )}
      {showAddMemberModal && addMemberGroup && (
        <AddMemberModal
          visible={showAddMemberModal}
          onClose={() => {
            setShowAddMemberModal(false);
            setAddMemberGroup(null);
            dispatch(fetchGroupMembers(addMemberGroup.id));
          }}
          groupId={addMemberGroup.id}
          existingMemberIds={
            (membersByGroupId[addMemberGroup.id] ?? []).map((m) => m.user_id)
          }          
        />
      )}
    </View>
  );
}
