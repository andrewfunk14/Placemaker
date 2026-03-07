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
import { uploadFromUri, deleteChatImage } from "../../../utils/uploadChatImage";
import { pickImageCompat, convertToJpegIfNeeded } from "../../../utils/imagePickerCompat";
import { User2, MinusCircle } from "lucide-react-native";

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

interface GroupChatProps {
  groupId: string;
}

export default function GroupChat({ groupId }: GroupChatProps) {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(scrollToBottom, 100);
    });
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
    const result = await pickImageCompat();
    if ((result as any)?.canceled) return;
    const asset = (result as any)?.assets?.[0];
    if (!asset?.uri) return;
    setUploading(true);
    try {
      const safeUri = await convertToJpegIfNeeded(asset.uri, asset.mimeType);
      const url = await uploadFromUri(safeUri);
      setPendingImage(url);
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
          style={[
            styles.messageInput,
            {
              minHeight: 40,
              maxHeight: 130,
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
          <Ionicons name="send" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>

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
        contentContainerStyle={{
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 16,
        }}
      >
        {messages.length === 0 && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
            <Text style={styles.emptyStateText}>Send the first message to start the conversation</Text>
          </View>
        )}

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
                <View style={{ paddingLeft: 56, marginBottom: 2, marginTop: 1 }}>
                  {m.image_url && (
                    <DynamicChatImage
                      uri={m.image_url}
                      maxWidth={240}
                      onPress={() => setViewingImage(m.image_url!)}
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
                      <User2 color={colors.accent} size={22} />
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
                      <Text style={styles.messageTimestamp}>
                        {formatTime(m.created_at)}
                      </Text>
                    </View>

                    {m.image_url && (
                      <DynamicChatImage
                        uri={m.image_url}
                        maxWidth={240}
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
        {pendingImage && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <View style={{ position: "relative", alignSelf: "flex-start" }}>
              <Image
                source={{ uri: pendingImage }}
                style={{ width: 120, height: 80, borderRadius: 8 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => {
                  deleteChatImage(pendingImage!);
                  setPendingImage(null);
                }}
                style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: "#0d0d0d", position: "absolute", top: -8, right: -8 }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <MinusCircle size={28} color={colors.danger}/>
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
            <Ionicons name="add-circle-outline" size={34} color={colors.textSecondary} />
          </TouchableOpacity>

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

      <ImageViewerModal
        uri={viewingImage}
        onClose={() => setViewingImage(null)}
      />
    </>
  );
}
