// home/eventCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { EventRow } from "../../store/slices/eventsSlice";
import { styles } from "../../styles/homeStyles";
import { cardShadow } from "../../styles/shadow";
import ParsedText from "react-native-parsed-text";

interface Props {
  item: EventRow;
  isCreator: boolean;
  startsInLabel: (iso: string) => { label: string; status: "future" | "now" | "past" };
  formatEventDateTime: (iso: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventCard({
  item,
  isCreator,
  startsInLabel,
  onEdit,
  onDelete,
}: Props) {
  const address = item.address?.trim() ?? "";

  // 🔍 Detect if it's a URL (Zoom, Meet, etc.)
  const isUrl = /^https?:\/\/\S+/i.test(address);

  // 🏠 Detect if it's a real street-style address
  const looksLikeAddress = (text: string) => {
    const cleaned = text.trim();
    const hasNumber = /\d/.test(cleaned);
    const hasLetter = /[A-Za-z]/.test(cleaned);
    const hasStreetSeparator = /\s+|,/.test(cleaned);
    const isGenericWord = /^(home|house|office|building|apt|my|the)$/i.test(cleaned);
    return hasNumber && hasLetter && hasStreetSeparator && !isGenericWord;
  };
  const isRealAddress = looksLikeAddress(address);

  // 🕒 Compute event timing info
  const { label, status } = startsInLabel(item.start_at);

  const date = new Date(item.start_at);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // 🎨 Style conditions
  const isNow = status === "now";
  const isPast = status === "past";

  return (
    <View
      style={[
        styles.card,
        cardShadow(),
        isNow && { borderColor: "#7fd35c" }, // green border when happening now
        isPast && { opacity: 0.7 }, // optional dimming for past events
      ]}
    >
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <Text
          style={[
            styles.badge,
            isNow && { backgroundColor: "#2f5f2f", color: "#9ae66e" },
            isPast && { backgroundColor: "#555", color: "#ccc" },
          ]}
        >
          {label}
        </Text>

        <View
          style={[styles.actionsTop, !isCreator && styles.actionsTopGhost]}
          pointerEvents={isCreator ? "auto" : "none"}
        >
          <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
            <Feather
              name="edit-2"
              size={24}
              style={[styles.iconEdit, !isCreator && styles.iconHidden]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
            <Feather
              name="trash-2"
              size={24}
              style={[styles.iconDelete, !isCreator && styles.iconHidden]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.cardTitle, { flexWrap: "wrap" }]}>{item.title}</Text>

      {/* Date + Time */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Text style={styles.cardMeta}>{dateLabel}</Text>
        <Text style={styles.cardDot}> • </Text>
        <Text style={styles.cardMeta}>{timeLabel}</Text>
      </View>

      {/* Address / Links */}
      {isUrl ? (
        <TouchableOpacity onPress={() => Linking.openURL(address)}>
          <Text style={[styles.cardMeta, { color: "#2e78b7" }]} numberOfLines={2}>
            {address}
          </Text>
        </TouchableOpacity>
      ) : isRealAddress ? (
        <TouchableOpacity
          onPress={() => {
            const encoded = encodeURIComponent(address);
            const url =
              Platform.OS === "ios"
                ? `maps://maps.apple.com/?q=${encoded}`
                : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
            Linking.openURL(url);
          }}
        >
          <Text style={[styles.cardMeta, { color: "#2e78b7" }]} numberOfLines={2}>
            {address}
          </Text>
        </TouchableOpacity>
      ) : address ? (
        <Text style={styles.cardMeta} numberOfLines={2}>
          {address}
        </Text>
      ) : null}

      {/* Description */}
      {item.description ? (
        <ParsedText
          style={[styles.cardDesc, { flexWrap: "wrap" }]}
          numberOfLines={Platform.OS === "web" ? undefined : 4}
          ellipsizeMode="tail"
          parse={[
            {
              type: "url",
              style: { color: "#2e78b7" },
              onPress: (url) => Linking.openURL(url),
            },
          ]}
        >
          {item.description}
        </ParsedText>
      ) : null}
    </View>
  );
}
