// home/eventCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from "react-native";
import { EventRow } from "../../store/slices/eventsSlice";
import { styles, colors } from "../../styles/homeStyles";
import { cardShadow } from "../../styles/shadow";
import ParsedText from "react-native-parsed-text";
import { User2 } from "lucide-react-native";
import { useUser } from "../../app/userContext";
import CardActionMenu from "../../components/CardActionMenu";

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

  const user = useUser();
  const isAdmin = user?.roles?.includes("admin");

  const [avatarError, setAvatarError] = useState(false);

  const showEllipsis = isCreator || isAdmin;

  const isUrl = /^https?:\/\/\S+/i.test(address);

  const looksLikeAddress = (text: string) => {
    const cleaned = text.trim();
    const hasNumber = /\d/.test(cleaned);
    const hasLetter = /[A-Za-z]/.test(cleaned);
    const hasStreetSeparator = /\s+|,/.test(cleaned);
    const isGenericWord = /^(home|house|office|building|apt|my|the)$/i.test(cleaned);
    return hasNumber && hasLetter && hasStreetSeparator && !isGenericWord;
  };
  const isRealAddress = looksLikeAddress(address);

  const { label, status } = startsInLabel(item.start_at);
  const isNow = status === "now";
  const isPast = status === "past";

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

  const avatarUrl = item.creator_profile?.avatar_url ?? null;

  return (
    <View
      style={[
        styles.card,
        cardShadow(),
        isNow && { borderColor: "#7fd35c" },
        isPast && { opacity: 0.7 },
      ]}
    >
      {/* Header row: avatar + badge inline, ellipsis right */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <View style={styles.cardAvatarLeft}>
          {avatarUrl && !avatarError ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <User2 color={colors.accent} size={26} />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={[
              styles.badge,
              isNow && { backgroundColor: "#2f5f2f", color: "#9ae66e" },
              isPast && { backgroundColor: "#555", color: "#ccc" },
            ]}
          >
            {label}
          </Text>
        </View>

        {showEllipsis && (
          <CardActionMenu
            items={[
              { label: "Edit", onPress: onEdit },
              { label: "Delete", onPress: onDelete, danger: true },
            ]}
          />
        )}
      </View>

      <Text style={[styles.cardTitle, { flexWrap: "wrap", marginBottom: 2 }]}>{item.title}</Text>
      {item.creator_profile?.name ? (
        <Text style={[styles.cardMeta, { marginBottom: 4 }]}>{item.creator_profile.name}</Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Text style={styles.cardDate}>{dateLabel}</Text>
        <Text style={styles.cardDot}> • </Text>
        <Text style={styles.cardTime}>{timeLabel}</Text>
      </View>

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

      {item.description ? (
        <ParsedText
          style={[styles.cardDesc, { flexWrap: "wrap" }]}
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
