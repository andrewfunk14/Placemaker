// (placemaker)/(chat)/groupChat.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import ImageViewerModal from "../../../components/ImageViewerModal";
import { Ionicons } from "@expo/vector-icons";
import { connectStyles as styles, colors } from "../../../styles/connectStyles";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import {
  fetchGroupMessages,
  sendGroupMessage,
  messageReceived,
  GroupMessage,
  selectMessagesByGroupId,
} from "../../../store/slices/groupMessagesSlice";
import { supabase } from "../../../lib/supabaseClient";
import { uploadChatImage, deleteChatImage } from "../../../utils/uploadChatImage";
import { User2 } from "lucide-react-native";

interface GroupChatProps {
  groupId: string;
}

export default function GroupChat({ groupId }: GroupChatProps) {
  const dispatch = useAppDispatch();

  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const messages = useAppSelector(selectMessagesByGroupId(groupId));

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    dispatch(fetchGroupMessages(groupId));
  }, [groupId]);

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", scrollToBottom);
    return () => showSub.remove();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          table: "group_messages",
          schema: "public",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMsg = payload.new as GroupMessage;

          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", newMsg.user_id)
            .maybeSingle();

          dispatch(
            messageReceived({
              ...newMsg,
              profiles: {
                name: profile?.name ?? "Unknown",
                avatar_url: profile?.avatar_url ?? null,
              },
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

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
      sendGroupMessage({
        groupId,
        content: text.trim(),
        imageUrl: pendingImage ?? undefined,
      })
    );
    setText("");
    setPendingImage(null);
    setInputHeight(40);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatDayHeader = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const canSend = (text.trim().length > 0 || !!pendingImage) && !uploading;

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
              paddingTop: Platform.OS === "ios" ? 10 : 8,
            },
          ]}
          onKeyPress={(e) => {
            if (Platform.OS === "web") {
              const shift = (e as any).shiftKey;
              if (e.nativeEvent.key === "Enter" && !shift) {
                e.preventDefault?.();
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

  return (
    <>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onContentSizeChange={scrollToBottom}
        contentContainerStyle={{
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 16,
        }}
      >
        {messages.map((m, i) => {
          const name = m.profiles?.name ?? "Unknown";
          const avatar = m.profiles?.avatar_url ?? null;

          const currentDay = formatDayHeader(m.created_at);
          const previousDay =
            i > 0 ? formatDayHeader(messages[i - 1].created_at) : null;
          const showDayHeader = currentDay !== previousDay;

          const prevMsg = i > 0 ? messages[i - 1] : null;
          const isContinuation =
            !showDayHeader && prevMsg?.user_id === m.user_id;

          return (
            <View key={m.id}>
              {showDayHeader && (
                <View style={styles.dayHeaderWrapper}>
                  <View style={styles.dayHeaderLine} />
                  <Text style={styles.dayHeaderText}>{currentDay}</Text>
                  <View style={styles.dayHeaderLine} />
                </View>
              )}

              {isContinuation ? (
                // Continuation — indented to align with text above, no avatar/name
                <View style={{ paddingLeft: 54, marginBottom: 2, marginTop: 1 }}>
                  {m.image_url && (
                    <TouchableOpacity
                      onPress={() => setViewingImage(m.image_url!)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: m.image_url }}
                        style={{
                          width: 220,
                          height: 165,
                          borderRadius: 8,
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
                    { marginTop: i > 0 && !showDayHeader ? 12 : 0 },
                  ]}
                >
                  <View style={styles.avatarWrapper}>
                    {avatar ? (
                      <Image
                        source={{ uri: avatar }}
                        style={styles.messageAvatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <User2 color={colors.accent} size={26} />
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
                      <Text style={styles.messageTimestamp}>
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
                            width: 220,
                            height: 165,
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
                const shift = (e as any).shiftKey;
                if (e.nativeEvent.key === "Enter" && !shift) {
                  e.preventDefault?.();
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
