// app/(tabs)/(connect)/connect.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchMyGroups, fetchGroupMembers } from "../../../../store/slices/groupsSlice";
import { colors, connectStyles as styles } from "../../../../styles/connectStyles";
import CreateGroupModal from "../../../connect/createGroupModal";
import AddMemberModal from "../../../connect/addMemberModal";
import { useUser } from "../../../userContext";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function ConnectScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const authUser = useAppSelector((state) => state.auth.user);
  const { userId: ctxUserId, roles: ctxRoles } = useUser();
  const userId = authUser?.id ?? ctxUserId;
  const roles = authUser?.roles ?? ctxRoles ?? [];
  const { groups, loading } = useAppSelector((state) => state.groups);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberGroup, setAddMemberGroup] = useState<any | null>(null);
  const membersByGroupId = useAppSelector((s) => s.groups.membersByGroupId);

  const isAdmin = roles.includes("admin");
  const isPlacemakerPaid = roles.some((r) =>
    ["placemaker", "dealmaker", "changemaker", "policymaker"].includes(r)
  );

  /** Load groups */
  useEffect(() => {
    if (userId) dispatch(fetchMyGroups({ userId, roles }));
  }, [userId, roles]);

  /** Refresh when page gains focus */
  useFocusEffect(
    useCallback(() => {
      if (userId) dispatch(fetchMyGroups({ userId, roles }));
    }, [userId, roles])
  );

  /** Load members for each group */
  useEffect(() => {
    groups.forEach((g) => dispatch(fetchGroupMembers(g.id)));
  }, [groups]);

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
      <ScrollView style={styles.groupsListScroll} contentContainerStyle={styles.groupsListContent}>
        {loading && <Text style={styles.loadingText}>Loading groups...</Text>}

        {!loading && groups.length === 0 && (
          <Text style={styles.emptyText}>No groups yet.</Text>
        )}

        {groups.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={styles.groupCard}
            onPress={() =>
              router.push(`/(placemaker)/(chat)/chat?groupId=${g.id}`)
            }
          >
            <View style={styles.groupCardHeader}>
              <Text style={styles.groupCardTitle}>{g.name}</Text>

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
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ADD GROUP BUTTON */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      )}

      {/* CREATE GROUP MODAL */}
      {isAdmin && (
        <CreateGroupModal
          visible={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            if (userId) dispatch(fetchMyGroups({ userId, roles }));
          }}
        />
      )}

      {/* ADD MEMBER MODAL */}
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
