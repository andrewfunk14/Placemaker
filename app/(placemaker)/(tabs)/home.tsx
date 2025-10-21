// app/(placemaker)/home.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchEvents } from "../../../store/slices/eventsSlice";
import { useUser } from "../../userContext";
import { differenceInMinutes } from "date-fns";
import NewEventModal from "../../NewEventModal";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: events, loading } = useAppSelector((s) => s.events);
  const { roles } = useUser();
  const canCreate = roles?.includes("placemaker");

  const [showNew, setShowNew] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const formatEventDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });  

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // search + sort ALL events by start_at ascending
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...events].sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );
    if (!q) return sorted;
    return sorted.filter((e) =>
      [e.title, e.address, e.description]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }, [events, query]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchEvents());
    setRefreshing(false);
  };

  const onCreate = () => setShowNew(true);

  const startsInLabel = (iso: string) => {
    const mins = Math.max(0, differenceInMinutes(new Date(iso), new Date()));
    if (mins < 60) return `Starts in ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `Starts in ${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.round(hours / 24);
    return `Starts in ${days} day${days === 1 ? "" : "s"}`;
  };

  const renderItem = ({ item }: any) => (
    <View
      style={styles.card}
    >
      <View style={styles.cardBanner}>
        <Text style={styles.badge}>{startsInLabel(item.start_at)}</Text>
      </View>

      <Text numberOfLines={2} style={styles.cardTitle}>
        {item.title}
      </Text>

      <View style={styles.cardMetaRow}>
      <Text style={styles.cardMeta}>{formatEventDateTime(item.start_at)}</Text>

        {item.address ? <Text style={styles.cardDot}> • </Text> : null}
        {item.address ? (
          <Text numberOfLines={1} style={styles.cardMeta}>
            {item.address}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#222222", "#0d0d0d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        {/* <Text style={styles.h1}>Upcoming Events</Text> */}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search Upcoming Events…"
        placeholderTextColor="#a0a0a0"
        selectionColor="#a0a0a0"
        keyboardAppearance="dark"
        autoCapitalize="none"
        style={styles.search}
      />
      </View>

      {/* List */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color="#ffd21f" style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>No Events Found</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(e) => e.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listPad}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffd21f"
                colors={["#ffd21f"]}
              />
            }
          />
        )}
      </View>

      {/* FAB (create) */}
      <TouchableOpacity
        style={[styles.fab, !canCreate && { opacity: 0.4 }]}
        onPress={canCreate ? onCreate : () => console.warn("Placemaker only")}
        accessibilityLabel="Create event"
      >
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

      {/* Modal */}
      <NewEventModal visible={showNew} onClose={() => setShowNew(false)} />
    </View>
  );
}

const webPad = Platform.select({ web: 24, default: 16 }) as number;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: webPad,
    paddingTop: 12,
  },
  h1: { color: "#fff", fontSize: 24, fontWeight: "800" },

  searchRow: { paddingHorizontal: webPad, paddingTop: 8 },
  search: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff",
  },

  content: { flex: 1 },

  listPad: { paddingHorizontal: webPad, paddingVertical: 16, gap: 12 },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffd21f",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
      default: {},
    }),
  },

  cardBanner: { marginBottom: 10 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,210,31,0.15)",
    color: "#ffd21f",
    fontWeight: "800",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "900", lineHeight: 22 },

  cardMetaRow: { flexDirection: "row", flexWrap: "nowrap", alignItems: "center", marginTop: 8 },
  cardMeta: { color: "#ccc", flexShrink: 1 },
  cardDot: { color: "#ccc" },

  cardCtaRow: { marginTop: 12, flexDirection: "row" },
  cta: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#ffd21f",
  },
  ctaText: { color: "#000", fontWeight: "800" },

  empty: { color: "#fff", opacity: 0.7, textAlign: "center", marginTop: 24, fontSize: 24, },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffd21f",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPlus: { fontSize: 28, fontWeight: "900", color: "#000" },
});
