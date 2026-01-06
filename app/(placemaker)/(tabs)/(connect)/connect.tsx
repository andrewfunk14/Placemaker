// app/(tabs)/(connect)/connect.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import { fetchMyGroups, fetchGroupMembers } from "../../../../store/slices/groupsSlice";
import { connectStyles as styles } from "../../../../styles/connectStyles";
import CreateGroupModal from "../../../connect/createGroupModal";
import AddMemberModal from "../../../connect/addMemberModal";
import { useUser } from "../../../userContext";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import useMatchmaking from "../../../../store/hooks/useMatchmaking";
import { ArrowRight, Send,  } from "lucide-react-native";

export default function ConnectScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const authUser = useAppSelector((state) => state.auth.user);
  const { userId: ctxUserId, roles: ctxRoles } = useUser();

  const userId = authUser?.id ?? ctxUserId;
  const roles = authUser?.roles ?? ctxRoles ?? [];

  const { groups } = useAppSelector((state) => state.groups);
  const membersByGroupId = useAppSelector((s) => s.groups.membersByGroupId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberGroup, setAddMemberGroup] = useState<any | null>(null);

  const isAdmin = roles.includes("admin");
  const isPlacemakerPaid = roles.some((r) =>
    ["placemaker", "dealmaker", "changemaker", "policymaker"].includes(r)
  );

  const { matches } = useMatchmaking(userId);

  useEffect(() => {
    if (userId) dispatch(fetchMyGroups({ userId, roles }));
  }, [userId, roles]);

  useFocusEffect(
    useCallback(() => {
      if (userId) dispatch(fetchMyGroups({ userId, roles }));
    }, [userId, roles])
  );

  useEffect(() => {
    groups.forEach((g) => dispatch(fetchGroupMembers(g.id)));
  }, [groups]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.groupsListScroll}
        // contentContainerStyle={styles.groupsListContent}
      >
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

              {(isAdmin || g.leader_id === userId) ? (
                <TouchableOpacity
                  style={styles.headerSmallFab}
                  onPress={() => {
                    setAddMemberGroup(g);
                    setShowAddMemberModal(true);
                  }}
                >
                  <Text style={styles.headerSmallFabText}>＋</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.headerSmallFab}
                  onPress={() =>
                    router.push(`/(placemaker)/(chat)/chat?groupId=${g.id}`)
                  }
                >
                  <ArrowRight
                    size={24}
                    strokeWidth={3}
                    color="#000"
                  />
                </TouchableOpacity>
              )}

              {/* {(isAdmin || g.leader_id === userId) && (
                <TouchableOpacity
                  style={styles.headerSmallFab}
                  onPress={() => {
                    setAddMemberGroup(g);
                    setShowAddMemberModal(true);
                  }}
                >
                  <Text style={styles.headerSmallFabText}>＋</Text>
                </TouchableOpacity>
              )} */}
            </View>
          </TouchableOpacity>
        ))}

        {isPlacemakerPaid && (
          <View>
            <Text style={styles.sectionHeader}>Curated Connections</Text>
            
            {matches.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.matchCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/(placemaker)/(chat)/dm?userId=${m.id}`)
                }
              >
                {/* LEFT SIDE */}
                <View style={styles.matchLeft}>
                  {m.avatar_url ? (
                    <Image source={{ uri: m.avatar_url }} style={styles.matchAvatar} />
                  ) : (
                    <View style={styles.matchAvatarFallback}>
                      <Text style={styles.matchAvatarInitial}>
                        {m.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.matchName}>{m.name}</Text>
                    <Text style={styles.matchTier}>
                      {m.profile_type?.toUpperCase()}
                    </Text>
                    <Text style={styles.matchSubtitle}>
                      {m.expertise?.slice(0, 3).join(", ") || "No expertise"}
                    </Text>
                  </View>
                </View>

                {/* RIGHT SIDE */}
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/(placemaker)/(chat)/dm?userId=${m.id}`)
                  }
                  hitSlop={10}
                  style={styles.matchMessageButton}
                >
                  <Send
                    size={28}
                    strokeWidth={2.5}
                    color={styles.matchMessageIcon?.color ?? "#fff"}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

          </View>
        )}
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      )}

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
            (membersByGroupId[addMemberGroup.id] ?? []).map(
              (m) => m.user_id
            )
          }
        />
      )}
    </View>
  );
}
