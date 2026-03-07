// (placemaker)/(chat)/directMessageChat.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { connectStyles as styles, colors } from "../../../styles/connectStyles";
import { supabase } from "../../../lib/supabaseClient";
import {
  fetchDMs,
  sendDM,
  makeSelectDMsByThread,
} from "../../../store/slices/dmSlice";
import { User2 } from "lucide-react-native";

function DynamicChatImage({ uri, maxWidth, onPress, style }: {
  uri: string;
  maxWidth: number;
  onPress: () => void;
  style?: object;
}) {
  const [height, setHeight] = useState(maxWidth * 0.75);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri }}
        style={[{ width: maxWidth, height, borderRadius: 8 }, style]}
        resizeMode="cover"
        onLoad={(e) => {
          const src = e.nativeEvent.source;
          if (src?.width && src?.height) {
            setHeight(Math.min((maxWidth * src.height) / src.width, 320));
          }
        }}
      />
    </TouchableOpacity>
  );
}

interface Profile {
  name: string;
  avatar_url: string | null;
}

export default function DirectMessageChat({ partnerId }: { partnerId: string }) {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<ScrollView>(null);

  const [text, setText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setMyId(uid);
      if (uid && partnerId) {
        setThreadId([uid, partnerId].sort().join("_"));
      }
    });
  }, [partnerId]);

  // Fetch both profiles once we have myId
  useEffect(() => {
    if (!myId) return;
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", myId)
      .maybeSingle()
      .then(({ data }) => setMyProfile(data ?? null));
  }, [myId]);

  useEffect(() => {
    if (!partnerId) return;
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", partnerId)
      .maybeSingle()
      .then(({ data }) => setPartnerProfile(data ?? null));
  }, [partnerId]);

  const EMPTY: any[] = [];

  const selectMessages = useMemo(() => {
    if (!threadId) return () => EMPTY;
    return makeSelectDMsByThread(threadId);
  }, [threadId]);

  const messages = useAppSelector(selectMessages);

  useEffect(() => {
    if (threadId) dispatch(fetchDMs(threadId));
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`dm-thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          dispatch(fetchDMs(threadId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [threadId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(scrollToBottom, 100);
    });
    return () => showSub.remove();
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;

    dispatch(
      sendDM({
        threadId,
        senderId: myId,
        receiverId: partnerId,
        content: text.trim(),
      })
    );
    setText("");
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const formatDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const canSend = text.trim().length > 0;

  return (
    <>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onContentSizeChange={scrollToBottom}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              if (!threadId) return;
              setRefreshing(true);
              await dispatch(fetchDMs(threadId));
              setRefreshing(false);
            }}
            tintColor={colors.accent}
          />
        }
      >
        {messages.length === 0 && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
            <Text style={styles.emptyStateText}>Send the first message to start the conversation</Text>
          </View>
        )}

        {messages.map((m, i) => {
          const mine = m.sender_id === myId;
          const profile = mine ? myProfile : partnerProfile;
          const name = profile?.name ?? (mine ? "You" : "Unknown");
          const avatar = profile?.avatar_url ?? null;

          const day = formatDay(m.created_at);
          const prevDay = i > 0 ? formatDay(messages[i - 1].created_at) : null;
          const showHeader = day !== prevDay;

          const prevMsg = i > 0 ? messages[i - 1] : null;
          const isContinuation =
            !showHeader && prevMsg?.sender_id === m.sender_id;

          return (
            <View key={m.id}>
              {showHeader && (
                <View style={styles.dayHeaderWrapper}>
                  <View style={styles.dayHeaderLine} />
                  <Text style={styles.dayHeaderText}>{day}</Text>
                  <View style={styles.dayHeaderLine} />
                </View>
              )}

              {isContinuation ? (
                <View style={{ paddingLeft: 56, marginBottom: 2, marginTop: 1 }}>
                  {m.image_url && (
                    <DynamicChatImage
                      uri={m.image_url}
                      maxWidth={220}
                      onPress={() => setViewingImage(m.image_url!)}
                      style={{ marginBottom: m.content ? 4 : 0, marginTop: 2 }}
                    />
                  )}
                  {!!m.content && (
                    <Text style={styles.slackMessageText}>{m.content}</Text>
                  )}
                </View>
              ) : (
                // First message in a group — avatar + name + timestamp inline
                <View
                  style={[
                    styles.messageRow,
                    { marginTop: i > 0 && !showHeader ? 12 : 0 },
                  ]}
                >
                  <View style={styles.avatarWrapper}>
                    {avatar ? (
                      <Image
                        source={{ uri: avatar }}
                        style={styles.messageAvatar}
                      />
                    ) : (
                   <View style={styles.avatarWrapper}>
                        <User2 color={colors.accent} size={22} />
                      </View>
                    )}
                  </View>

                  <View style={styles.messageContentBlock}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={styles.messageSender}
                      >
                        {name}
                      </Text>
                      <Text style={[styles.messageTimestamp, { marginTop: 0 }]}>
                        {formatTime(m.created_at)}
                      </Text>
                    </View>

                    {m.image_url && (
                      <DynamicChatImage
                        uri={m.image_url}
                        maxWidth={220}
                        onPress={() => setViewingImage(m.image_url!)}
                        style={{ marginBottom: m.content ? 4 : 0, marginTop: 2 }}
                      />
                    )}

                    {!!m.content && (
                      <Text style={styles.slackMessageText}>{m.content}</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: "#222", paddingBottom: Platform.OS === "android" ? 8 : 0 }}>
        <View style={styles.messageInputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor={colors.placeholderText}
            keyboardAppearance="dark"
            multiline
            style={[
              styles.messageInput,
              {
                maxHeight: 100,
                color: "#f5f5f5",
                borderWidth: 1,
                borderColor: colors.translucentBorder,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 9,
              },
            ]}
            onKeyPress={(e) => {
              if (Platform.OS === "web") {
                if (e.nativeEvent.key === "Enter" && !(e as any).shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }
            }}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: canSend ? 1 : 0.35 },
            ]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Ionicons name="send" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    </>
  );
}
