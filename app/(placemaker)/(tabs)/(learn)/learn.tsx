// (tabs)/(learn)/learn.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { learnStyles as styles, colors } from "../../../../styles/learnStyles";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import { fetchResources } from "../../../../store/slices/resourcesSlice";
import ResourceList from "../../../learn/resourceList";
import UploadModal from "../../../learn/uploadModal";
import { useUser } from "../../../../app/userContext";

function getCreatorId(r: any): string | null {
  if (!r?.uploaded_by) return null;
  return typeof r.uploaded_by === "object" ? r.uploaded_by.id ?? null : r.uploaded_by;
}

export default function LearnScreen() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.resources);
  const user = useUser();

  const [search, setSearch] = useState("");
  const searchRef = useRef<TextInput>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const currentUserId = user?.userId ?? null;
  const isAdmin = !!user?.roles?.includes("admin");
  const isPaidUser =
    user?.roles?.some((r) =>
      ["admin", "placemaker", "dealmaker", "changemaker", "policymaker"].includes(r)
    ) ?? false;
  
  const canUploadResource = isPaidUser || isAdmin;

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((r) => {
      const creatorId = getCreatorId(r);
      const canSee =
        isAdmin || r.is_approved || (!!currentUserId && creatorId === currentUserId);
      if (canSee) r.tags?.forEach((t: string) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [items, isAdmin, currentUserId]);

  const filtered = useMemo(() => {
    return items
      .filter((r) => {
        const creatorId = getCreatorId(r);
        const canSee =
          isAdmin || r.is_approved || (!!currentUserId && creatorId === currentUserId);

        if (!canSee) return false;

        const isCreator = !!currentUserId && creatorId === currentUserId;
        if (!isAdmin && !isCreator && r.tier_access === "paid" && !isPaidUser) {
          return false;
        }

        if (
          search &&
          !r.title?.toLowerCase().includes(search.toLowerCase()) &&
          !r.description?.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }

        if (
          selectedTags.length > 0 &&
          !r.tags?.some((t: string) => selectedTags.includes(t))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => Number(a.is_approved) - Number(b.is_approved));
  }, [items, search, selectedTags, isAdmin, isPaidUser, currentUserId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Pressable
          style={[styles.search, { flexDirection: "row", alignItems: "center" }]}
          onPress={() => searchRef.current?.focus()}
        >
          <Ionicons name="search" size={18} color={colors.placeholderText} style={{ marginRight: 8 }} />
          <TextInput
            ref={searchRef}
            value={search}
            onChangeText={setSearch}
            placeholder="Search Resources"
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
        {allTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagContainer}
            style={styles.tagScroll}
          >
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tagPill,
                    active && {
                      backgroundColor: `${colors.accent}20`,
                      borderColor: `${colors.accent}55`,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      active && {
                        color: colors.accent,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(fetchResources())}
            tintColor={colors.accent}
          />
        }
      >
        <ResourceList resources={filtered} user={user} />
      </ScrollView>

      {canUploadResource && (
        <TouchableOpacity
          onPress={() => setShowUpload(true)}
          style={styles.fab}
          activeOpacity={0.7}
          accessibilityLabel="Upload resource"
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      )}

      {showUpload && (
        <UploadModal
          visible={showUpload}
          onClose={() => {
            setShowUpload(false);
            setTimeout(() => dispatch(fetchResources()), 250);
          }}
          mode="add"
        />
      )}
    </View>
  );
}
