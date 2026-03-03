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
  Platform,
  Alert,
} from "react-native";
import ImageViewerModal from "../../../components/ImageViewerModal";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { connectStyles as styles, colors } from "../../../styles/connectStyles";
import { supabase } from "../../../lib/supabaseClient";
import {
  fetchDMs,
  sendDM,
  makeSelectDMsByThread,
} from "../../../store/slices/dmSlice";
import { uploadChatImage, deleteChatImage } from "../../../utils/uploadChatImage";
import { User2 } from "lucide-react-native";

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
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

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

  const handlePickImage = async () => {
    try {
      setUploading(true);
      const url = await uploadChatImage();
      if (url) setPendingImage(url);
    } catch (err: any) {
      Alert.alert("Upload Error", err.message ?? "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !pendingImage) return;

    dispatch(
      sendDM({
        threadId,
        senderId: myId,
        receiverId: partnerId,
        content: text.trim(),
        imageUrl: pendingImage ?? undefined,
      })
    );
    setText("");
    setPendingImage(null);
    setInputHeight(40);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const formatDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const canSend = (text.trim().length > 0 || !!pendingImage) && !uploading;

  return (
    <>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onContentSizeChange={scrollToBottom}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
      >
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
                // Continuation — indented, no avatar/name
                <View style={{ paddingLeft: 54, marginBottom: 2, marginTop: 1 }}>
                  {m.image_url && (
                    <TouchableOpacity
                      onPress={() => setViewingImage(m.image_url!)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: m.image_url }}
                        style={{
                          width: 200,
                          height: 150,
                          borderRadius: 8,
                          marginBottom: m.content ? 4 : 0,
                          marginTop: 2,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
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
                        <User2 color={colors.accent} size={26} />
                      </View>
                    )}
                  </View>

                  <View style={styles.messageContentBlock}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 6,
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
                      <TouchableOpacity
                        onPress={() => setViewingImage(m.image_url!)}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{ uri: m.image_url }}
                          style={{
                            width: 200,
                            height: 150,
                            borderRadius: 8,
                            marginBottom: m.content ? 4 : 0,
                            marginTop: 2,
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
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

      <View style={{ borderTopWidth: 1, borderTopColor: "#222" }}>
        {pendingImage && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <View style={{ position: "relative", alignSelf: "flex-start" }}>
              <Image
                source={{ uri: pendingImage }}
                style={{ width: 80, height: 80, borderRadius: 8 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => {
                  deleteChatImage(pendingImage!);
                  setPendingImage(null);
                }}
                style={{ position: "absolute", top: -8, right: -8 }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.messageInputRow}>
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={uploading}
            style={{ justifyContent: "center", marginRight: 8 }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add-circle-outline" size={32} color={colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor={colors.placeholderText}
            keyboardAppearance="dark"
            multiline
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height;
              setInputHeight(Math.min(Math.max(40, h), 120));
            }}
            style={[
              styles.messageInput,
              {
                height: inputHeight,
                color: "#f5f5f5",
                borderWidth: 1,
                borderColor: colors.translucentBorder,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingTop: 10,
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
              { paddingHorizontal: 12, opacity: canSend ? 1 : 0.35 },
            ]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Ionicons name="send" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>

      <ImageViewerModal
        uri={viewingImage}
        onClose={() => setViewingImage(null)}
      />
    </>
  );
}
