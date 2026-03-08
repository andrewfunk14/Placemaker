// app/(tabs)/(connect)/connect.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Pressable, ScrollView, Image, Platform, RefreshControl } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import { fetchMyGroups, fetchGroupMembers, deleteGroup } from "../../../../store/slices/groupsSlice";
import { connectStyles as styles, colors } from "../../../../styles/connectStyles";
import CreateGroupModal from "../../../connect/createGroupModal";
import AddMemberModal from "../../../connect/addMemberModal";
import DeleteConfirmModal from "../../../../components/DeleteConfirmModal";
import { useUser } from "../../../userContext";
import { supabase } from "../../../../lib/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import useMatchmaking from "../../../../store/hooks/useMatchmaking";
import { ArrowRight, Send, MinusCircle } from "lucide-react-native";
import { User2 } from "lucide-react-native";

export default function ConnectScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const authUser = useAppSelector((state) => state.auth.user);
  const { userId: ctxUserId, roles: ctxRoles } = useUser();

  const userId = authUser?.id ?? ctxUserId;
  const roles = authUser?.roles ?? ctxRoles ?? [];

  const { groups } = useAppSelector((state) => state.groups);
  const [refreshing, setRefreshing] = useState(false);
  const membersByGroupId = useAppSelector((s) => s.groups.membersByGroupId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberGroup, setAddMemberGroup] = useState<any | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string } | null>(null);

  const isAdmin = roles.includes("admin");
  const isPlacemakerPaid = roles.some((r) =>
    ["placemaker", "dealmaker", "changemaker", "policymaker"].includes(r)
  );

  const { matches, refetch: refetchMatches } = useMatchmaking(userId);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (userId) dispatch(fetchMyGroups({ roles, userId }));
  }, [userId, roles]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        dispatch(fetchMyGroups({ roles, userId }));
        refetchMatches();
      }
    }, [userId, roles])
  );

  useEffect(() => {
    groups.forEach((g) => dispatch(fetchGroupMembers(g.id)));
  }, [groups]);

  // Re-fetch groups when this user is added to a new group
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("my-group-memberships")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_members",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          dispatch(fetchMyGroups({ roles, userId }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.groupsListScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              if (!userId) return;
              setRefreshing(true);
              await Promise.all([
                dispatch(fetchMyGroups({ roles, userId })),
                refetchMatches(),
              ]);
              setRefreshing(false);
            }}
            tintColor={colors.accent}
          />
        }
      >
      <Text style={styles.topHeader}>Your Groups</Text>
        {groups.length === 0 && (
          <Text style={styles.emptyStateText}>
            Join a group first to view chats
          </Text>
        )}

        {groups.map((g) => (
          <Pressable
            key={g.id}
            style={styles.groupCard}
            onPress={() => {
              if (Platform.OS === "web") {
                (document.activeElement as HTMLElement | null)?.blur();
              }

              router.push(`/(placemaker)/(chat)/chat?groupId=${g.id}`);
            }}
          >
            <View style={styles.groupCardHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => setGroupToDelete({ id: g.id, name: g.name })}
                    hitSlop={8}
                    style={{ marginRight: 8 }}
                  >
                    <MinusCircle size={28} color="#e05252" />
                  </TouchableOpacity>
                )}
                <Text style={styles.groupCardTitle}>{g.name}</Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                    color="#0d0d0d"
                  />
                </TouchableOpacity>
              )}
              </View>
            </View>
          </Pressable>
        ))}

        {isPlacemakerPaid && (
          <View>
            <Text style={styles.sectionHeader}>Curated Connections</Text>

            {matches.length === 0 && (
              <Text style={styles.emptyStateText}>
                Finish setting up your profile to see recommended connections
              </Text>
            )}

            {matches.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.matchCard}
                activeOpacity={0.8}
                onPress={() => {
                  if (Platform.OS === "web") {
                    (document.activeElement as HTMLElement | null)?.blur();
                  }
                
                  router.push(`/(placemaker)/(chat)/dm?userId=${m.id}`)
                }}
              >
                {/* LEFT SIDE */}
                <View style={styles.matchLeft}>
                  <View style={styles.cardAvatarLeft}>
                    {m.avatar_url && !avatarError ? (
                      <Image
                        source={{ uri: m.avatar_url }}
                        style={{ width: 60, height: 60, borderRadius: 30 }}
                        resizeMode="cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <View
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <User2 color={colors.accent} size={26} />
                      </View>
                    )}
                  </View>

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
                    color={styles.matchMessageIcon?.color ?? "#f5f5f5"}
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
            if (userId) dispatch(fetchMyGroups({ roles, userId }));
          }}
        />
      )}

      <DeleteConfirmModal
        visible={!!groupToDelete}
        itemType="group"
        onCancel={() => setGroupToDelete(null)}
        onConfirm={async () => {
          if (groupToDelete) await dispatch(deleteGroup(groupToDelete.id));
          setGroupToDelete(null);
        }}
      />

      {showAddMemberModal && addMemberGroup && (
        <AddMemberModal
          visible={showAddMemberModal}
          onClose={() => {
            setShowAddMemberModal(false);
            setAddMemberGroup(null);
          }}
          groupId={addMemberGroup.id}
          existingMembers={membersByGroupId[addMemberGroup.id] ?? []}
        />
      )}
    </View>
  );
}
