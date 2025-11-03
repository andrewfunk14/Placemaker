// (placemaker)/learn.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { learnStyles as styles, colors } from "../../../../styles/learnStyles";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchResources } from "../../../../store/slices/resourcesSlice";
import ResourceList from "../../../learn/resourceList";
import UploadModal from "../../../learn/uploadModal";
import { useUser } from "../../../../app/userContext";

export default function LearnScreen() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.resources);
  const user = useUser();

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  // === FETCH RESOURCES ===
  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  // === USER PERMISSIONS ===
  const isAdmin = user?.roles?.includes("admin");
  const isPaidUser =
    user?.roles?.some((r) =>
      ["admin", "placemaker", "dealmaker", "changemaker", "policymaker"].includes(r)
    ) ?? false;

  // === COLLECT VISIBLE TAGS ===
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((r) => {
      const canSee =
        (r.is_approved && r.tier_access === "free") ||
        (isPaidUser && r.is_approved) ||
        isAdmin;
      if (canSee) r.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [items, isPaidUser, isAdmin]);

  // === FILTER LOGIC ===
  const filtered = useMemo(() => {
    return items
      .filter((r) => {
        if (!r.is_approved && !isAdmin) return false; // only admins see unapproved
        if (!isPaidUser && r.tier_access === "paid") return false; // free users see only free
        if (
          search &&
          !r.title.toLowerCase().includes(search.toLowerCase()) &&
          !r.description?.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (selectedTags.length > 0 && !r.tags.some((t) => selectedTags.includes(t)))
          return false;
        return true;
      })
      .sort((a, b) => Number(a.is_approved) - Number(b.is_approved));
  }, [items, search, selectedTags, isAdmin, isPaidUser]);

  // === TOGGLE TAG FILTER ===
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <View style={styles.container}>
      {/* === Search Bar === */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search Resources"
          placeholderTextColor={colors.placeholderText}
          value={search}
          onChangeText={setSearch}
        />

        {/* === Tag Filters === */}
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

      <ScrollView style={styles.content}>
        <ResourceList resources={filtered} user={user} />
      </ScrollView>


      {/* === Floating + Button === */}
      <TouchableOpacity
        onPress={() => {
          if (isPaidUser) setShowUpload(true);
        }}
        style={[styles.fab, !isPaidUser && { opacity: 0.4 }]}
      >
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

      {/* === Upload Modal === */}
      <UploadModal visible={showUpload} onClose={() => setShowUpload(false)} />
    </View>
  );
}
