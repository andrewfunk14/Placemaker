// app/(placemaker)/home.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchEvents, EventRow, deleteEvent } from "../../../store/slices/eventsSlice";
import { useUser } from "../../userContext";
import { differenceInMinutes } from "date-fns";
import NewEventModal from "../../newEventModal";
import { Feather } from "@expo/vector-icons";

export default function Home() {
  const dispatch = useAppDispatch();
  const { items: events, loading } = useAppSelector((s) => s.events);

  // ✅ From your UserContext ({ userId, roles })
  const { userId, roles } = useUser();
  const myId = userId ?? null;
  const canCreate = roles.includes("placemaker");

  const [showNew, setShowNew] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [toDelete, setToDelete] = useState<EventRow | null>(null); // confirm dialog state
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const formatEventDateTime = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

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
      [e.title, e.address, e.description].filter(Boolean).some((s) => String(s).toLowerCase().includes(q))
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

  const askDelete = (ev: EventRow) => setToDelete(ev);

  const confirmDelete = async () => {
    if (!toDelete) return;

    // 🔎 quick visibility on identities before the privileged action
    console.log("DELETE attempt", { eventId: toDelete.id, created_by: toDelete.created_by, myId });

    try {
      await dispatch(deleteEvent(toDelete.id)).unwrap();
      setToDelete(null);
      // Optional: force re-fetch if your slice doesn't optimistically remove
      // await dispatch(fetchEvents());
    } catch (e: any) {
      console.error("Delete failed:", e);
      Alert.alert("Error", e?.message ?? "Failed to delete event.");
      setToDelete(null);
    }
  };

  const renderItem = ({ item }: { item: EventRow }) => {
    const isCreator = !!myId && item.created_by === myId;
  
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.badge}>{startsInLabel(item.start_at)}</Text>
    
          {/* Always render the actions container so layout doesn't shift */}
          <View
            style={[
              styles.actionsTop,
              !isCreator && styles.actionsTopGhost, // make it invisible & untouchable
            ]}
            pointerEvents={isCreator ? "auto" : "none"}
            accessibilityElementsHidden={!isCreator}
            importantForAccessibility={isCreator ? "auto" : "no-hide-descendants"}
          >
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setSelectedEvent(item)}
              disabled={!isCreator}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="edit-2" size={24} style={[styles.iconEdit, !isCreator && styles.iconHidden]} />
            </TouchableOpacity>
    
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => askDelete(item)}
              disabled={!isCreator}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="trash-2" size={24} style={[styles.iconDelete, !isCreator && styles.iconHidden]} />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Title below header */}
        <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
  
        {/* Meta row stays the same */}
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>{formatEventDateTime(item.start_at)}</Text>
          {item.address ? <Text style={styles.cardDot}> • </Text> : null}
          {item.address ? (
            <Text numberOfLines={1} style={styles.cardMeta}>{item.address}</Text>
          ) : null}
        </View>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={4}>
            {item.description}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#222222", "#0d0d0d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.headerRow} />

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

      {/* Create FAB */}
      <TouchableOpacity
        style={[styles.fab, !canCreate && { opacity: 0.4 }]}
        onPress={canCreate ? onCreate : () => console.warn("Placemaker only")}
        accessibilityLabel="Create event"
      >
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

      {/* Create / Edit Modal */}
      <NewEventModal
        visible={showNew || !!selectedEvent}
        onClose={() => { setShowNew(false); setSelectedEvent(null); }}
        event={selectedEvent}
        currentUserId={myId}
      />

      {/* Confirm Delete Modal */}
      <Modal transparent animationType="fade" visible={!!toDelete} onRequestClose={() => setToDelete(null)}>
        {/* Make the backdrop itself pressable */}
        <Pressable style={styles.modalBackdrop} onPress={() => setToDelete(null)} />

        {/* Put the card above the backdrop */}
        <View style={styles.modalCardWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete this event?</Text>
            <Text style={styles.modalBody}>This action cannot be undone</Text>
            <View style={[styles.modalRow, { gap: 10 }]}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={() => setToDelete(null)}>
                <Text style={[styles.modalBtnText, styles.modalBtnGhostText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={confirmDelete}>
                <Text style={[styles.modalBtnText, styles.modalBtnDangerText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffd21f",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
      default: {},
    }),
  },

  cardBanner: { marginBottom: 12 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,210,31,0.15)",
    color: "#ffd21f",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  cardTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: Platform.OS === "web" ? 0 : 4,
  },

  cardMetaRow: { flexDirection: "row", flexWrap: "nowrap", alignItems: "center", marginTop: 8 },
  cardMeta: { color: "#ccc", fontSize: 18, flexShrink: 1 },
  cardDesc: {
    marginTop: 8,
    color: "#fcfcfc",
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.95,
  },  
  cardDot: { color: "#ccc" },

  cardCtaRow: { marginTop: 12, flexDirection: "row" },
  cta: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#ffd21f",
  },
  ctaText: { color: "#000", fontWeight: "800" },

  // Danger variant for inline Delete button
  ctaDanger: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ff4d4f",
  },
  ctaDangerText: { color: "#ff4d4f" },

  empty: { color: "#fff", opacity: 0.7, textAlign: "center", marginTop: 24, fontSize: 24 },

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

  // Confirm Delete modal styles
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalCardWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 300,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#0d0d0d",
    borderWidth: 2,
    borderColor: "#ffd21f",
  },
  modalTitle: { color: "#ffd21f", fontSize: 22, fontWeight: "700", textAlign: "center" },
  modalBody: { color: "#cfcfcf", fontSize: 18, marginTop: 8, textAlign: "center" },
  modalRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },

  modalBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#ffd21f",
  },
  modalBtnText: { color: "#000", fontSize: 18, fontWeight: "800" },

  modalBtnGhost: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#ffd21f" },
  modalBtnGhostText: { color: "#ffd21f" },

  modalBtnDanger: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#ff4d4f" },
  modalBtnDangerText: { color: "#ff4d4f" },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  
  actionsTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  
  actionsTopGhost: {
    opacity: 0, // hide the whole pill & icons
  },
  
  iconBtn: { padding: 2 },
  iconEdit: { color: "#ffd21f" },
  iconDelete: { color: "#ff4d4f" },
  iconHidden: { opacity: 0 },
    
});
