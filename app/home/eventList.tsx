// home/eventList.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { EventRow } from "../../store/slices/eventsSlice";
import EventCard from "../home/eventCard";
import { styles } from "../../store/styles/homeStyles";

interface EventListProps {
  events: EventRow[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  currentUserId: string | null;
  formatEventDateTime: (iso: string) => string;
  startsInLabel: (iso: string) => string;
  onEdit: (event: EventRow) => void;
  onDelete: (event: EventRow) => void;
}

export default function EventList({
  events,
  loading,
  refreshing,
  onRefresh,
  currentUserId,
  formatEventDateTime,
  startsInLabel,
  onEdit,
  onDelete,
}: EventListProps) {
  if (loading) {
    return (
      <View style={{ marginTop: 24 }}>
        <ActivityIndicator color="#ffd21f" />
      </View>
    );
  }

  if (!events.length) {
    return (
      <Text style={styles.empty}>No Events Found</Text>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => (
        <EventCard
          item={item}
          isCreator={!!currentUserId && item.created_by === currentUserId}
          startsInLabel={startsInLabel}
          formatEventDateTime={formatEventDateTime}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      )}
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
  );
}
