// (tabs)/(learn)/learn.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { learnStyles as styles, colors } from "../../../../styles/learnStyles";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
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
        <TextInput
          style={styles.search}
          placeholder="Search Resources"
          placeholderTextColor={colors.placeholderText}
          value={search}
          onChangeText={setSearch}
        />
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
                  style={[styles.tagPill, active && styles.tagPillActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
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

      <TouchableOpacity
        onPress={() => {
          if (isPaidUser) setShowUpload(true);
        }}
        style={[styles.fab, !isPaidUser && { opacity: 0.4 }]}
        activeOpacity={isPaidUser ? 0.7 : 1}
      >
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

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
