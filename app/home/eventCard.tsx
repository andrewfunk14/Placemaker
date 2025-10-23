// home/eventCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { EventRow } from "../../store/slices/eventsSlice";
import { styles } from "../../store/styles/homeStyles";
import { cardShadow } from "../../store/styles/shadow";

interface Props {
  item: EventRow;
  isCreator: boolean;
  startsInLabel: (iso: string) => string;
  formatEventDateTime: (iso: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventCard({
  item,
  isCreator,
  startsInLabel,
  formatEventDateTime,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={[styles.card, cardShadow()]}>
      <View style={styles.cardHeader}>
        <Text style={styles.badge}>{startsInLabel(item.start_at)}</Text>

        <View
          style={[styles.actionsTop, !isCreator && styles.actionsTopGhost]}
          pointerEvents={isCreator ? "auto" : "none"}
        >
          <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
            <Feather name="edit-2" size={24} style={[styles.iconEdit, !isCreator && styles.iconHidden]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
            <Feather name="trash-2" size={24} style={[styles.iconDelete, !isCreator && styles.iconHidden]} />
          </TouchableOpacity>
        </View>
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

      {item.description ? (
        <Text style={styles.cardDesc} numberOfLines={4}>
          {item.description}
        </Text>
      ) : null}
    </View>
  );
}
