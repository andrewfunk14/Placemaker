// (placemaker)/(tabs)/home.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchEvents, deleteEvent, EventRow } from "../../../store/slices/eventsSlice";
import { useUser } from "../../userContext";
import { differenceInMinutes } from "date-fns";
import NewEventModal from "../../home/newEventModal/newEventModal";
import DeleteConfirmModal from "../../home/deleteConfirmModal";
import { styles } from "../../../store/styles/homeStyles";
import EventList from "../../home/eventList";

export default function Home() {
  const dispatch = useAppDispatch();
  const { items: events, loading } = useAppSelector((s) => s.events);
  const { userId, roles } = useUser();

  const [showNew, setShowNew] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [toDelete, setToDelete] = useState<EventRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const myId = userId ?? null;
  const canCreate = roles.includes("placemaker");

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

  const startsInLabel = (iso: string) => {
    const mins = Math.max(0, differenceInMinutes(new Date(iso), new Date()));
    if (mins < 60) return `Starts in ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `Starts in ${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.round(hours / 24);
    return `Starts in ${days} day${days === 1 ? "" : "s"}`;
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
    <View style={styles.root}>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Events"
          placeholderTextColor="#a0a0a0"
          selectionColor="#a0a0a0"
          keyboardAppearance="dark"
          autoCapitalize="none"
          style={styles.search}
        />
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

      <TouchableOpacity
        style={[styles.fab, !canCreate && { opacity: 0.4 }]}
        onPress={canCreate ? () => setShowNew(true) : undefined}
        accessibilityLabel="Create event"
      >
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

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
      />
    </View>
  );
}
