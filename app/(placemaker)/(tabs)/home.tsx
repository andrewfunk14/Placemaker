// (placemaker)/(tabs)/home.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { fetchEvents, deleteEvent, EventRow } from "../../../store/slices/eventsSlice";
import { useUser } from "../../userContext";
import NewEventModal from "../../home/newEventModal/newEventModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { styles, colors } from "../../../styles/homeStyles";
import EventList from "../../home/eventList";
import { startsInLabel, formatEventDate, formatEventTime } from "../../../utils/time"

export default function Home() {
  const dispatch = useAppDispatch();
  const { items: events, loading } = useAppSelector((s) => s.events);
  const { userId, roles } = useUser();

  const [showNew, setShowNew] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [toDelete, setToDelete] = useState<EventRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<TextInput>(null);

  const myId = userId ?? null;
  const isPlacemakerCreator =
    roles?.includes("placemaker") || roles?.includes("admin");

  const formatEventDateTime = useCallback(
    (iso: string) => `${formatEventDate(iso)} • ${formatEventTime(iso)}`,
    []
  );

  const [clock, setClock] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => setClock((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

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

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteEvent(toDelete.id)).unwrap();
      setToDelete(null);
    } catch (e: any) {
      console.error("Delete failed:", e);
      Alert.alert("Error", e?.message ?? "Failed to delete event.");
      setToDelete(null);
    }
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
            value={query}
            onChangeText={setQuery}
            placeholder="Search Events"
            placeholderTextColor={colors.placeholderText}
            selectionColor={colors.placeholderText}
            keyboardAppearance="dark"
            autoCapitalize="none"
            style={[
              { flex: 1, color: colors.textPrimary, fontSize: 16, alignSelf: "stretch" },
              Platform.OS === "web" && { outlineStyle: "none" } as any,
            ]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close" size={20} color={colors.placeholderText} />
            </Pressable>
          )}
        </Pressable>
      </View>
      <View style={styles.content}>
        <EventList
          events={filtered}
          loading={loading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          currentUserId={myId}
          formatEventDateTime={formatEventDateTime}
          startsInLabel={startsInLabel}
          onEdit={(event) => setSelectedEvent(event)}
          onDelete={(event) => setToDelete(event)}
        />
      </View>

      {isPlacemakerCreator && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowNew(true)}
          accessibilityLabel="Create event"
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      )}

      <NewEventModal
        visible={showNew || !!selectedEvent}
        event={selectedEvent}
        currentUserId={myId}
        onClose={() => {
          setShowNew(false);
          setSelectedEvent(null);
        }}
      />

      <DeleteConfirmModal
        visible={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        itemType="event"
      />
    </View>
  );
}
