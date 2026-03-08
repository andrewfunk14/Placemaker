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
import CardActionMenu from "../../../components/CardActionMenu";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { Ionicons } from "@expo/vector-icons";
import { connectStyles as styles, colors } from "../../../styles/connectStyles";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import {
  fetchGroupMessages,
  sendGroupMessage,
  editGroupMessage,
  deleteGroupMessage,
  messageReceived,
  messageUpdated,
  messageDeleted,
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ alignSelf: "flex-start" }}>
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
  const inputRef = useRef<TextInput>(null);
  const suppressScrollRef = useRef(false);
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteMsg, setPendingDeleteMsg] = useState<GroupMessage | null>(null);

  const [myId, setMyId] = useState<string | null>(null);

  const messages = useAppSelector(selectMessagesByGroupId(groupId));
  const authUser = useAppSelector((state: any) => state.auth.user);
  const isAdmin = authUser?.roles?.includes("admin") ?? false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMyId(data.user?.id ?? null);
    });
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    dispatch(fetchGroupMessages(groupId));
  }, [groupId]);

  useEffect(() => {
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false;
      return;
    }
    if (!editingMessageId) setTimeout(scrollToBottom, 50);
  }, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      if (!editingMessageId) setTimeout(scrollToBottom, 100);
    });
    return () => showSub.remove();
  }, [editingMessageId]);

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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          table: "group_messages",
          schema: "public",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          dispatch(messageUpdated(payload.new as GroupMessage));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          table: "group_messages",
          schema: "public",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          dispatch(messageDeleted({ groupId, messageId: payload.old.id }));
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

  const handleStartEdit = (msg: GroupMessage) => {
    setEditingMessageId(msg.id);
    setText(msg.content);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setText("");
  };

  const handleDeleteMessage = (msg: GroupMessage) => {
    setPendingDeleteMsg(msg);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteMsg) return;
    suppressScrollRef.current = true;
    dispatch(deleteGroupMessage({ messageId: pendingDeleteMsg.id, groupId, imageUrl: pendingDeleteMsg.image_url }));
    setShowDeleteConfirm(false);
    setPendingDeleteMsg(null);
  };

  const handleSend = () => {
    if (editingMessageId) {
      if (!text.trim()) return;
      suppressScrollRef.current = true;
      dispatch(editGroupMessage({ messageId: editingMessageId, groupId, content: text.trim() }));
      setEditingMessageId(null);
      setText("");
      return;
    }
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

  const canSend = editingMessageId
    ? text.trim().length > 0
    : (text.trim().length > 0 || !!pendingImage) && !uploading;

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
        onContentSizeChange={editingMessageId ? undefined : scrollToBottom}
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

          const canActOnMessage = myId && m.user_id === myId;

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
                <View style={{ paddingLeft: 56, marginBottom: 8, marginTop: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={styles.messageTimestamp}>
                      {formatTime(m.created_at)}
                    </Text>
                    {canActOnMessage && (
                      <CardActionMenu
                        iconName="ellipsis-horizontal"
                        iconSize={20}
                        items={[
                          { label: "Edit", icon: "create-outline", onPress: () => handleStartEdit(m) },
                          { label: "Delete", icon: "trash-outline", onPress: () => handleDeleteMessage(m), danger: true },
                        ]}
                      />
                    )}
                  </View>
                  {!!m.content && (
                    <Text style={[styles.slackMessageText, m.image_url ? { marginBottom: 4 } : {}]}>{m.content}</Text>
                  )}
                  {m.image_url && (
                    <DynamicChatImage
                      uri={m.image_url}
                      maxWidth={240}
                      onPress={() => setViewingImage(m.image_url!)}
                    />
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
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={styles.messageSender}>{name}</Text>
                      <Text style={styles.messageTimestamp}>
                        {formatTime(m.created_at)}
                      </Text>
                      {canActOnMessage && (
                        <CardActionMenu
                          iconName="ellipsis-horizontal"
                          iconSize={20}
                          items={[
                            { label: "Edit", icon: "create-outline", onPress: () => handleStartEdit(m) },
                            { label: "Delete", icon: "trash-outline", onPress: () => handleDeleteMessage(m), danger: true },
                          ]}
                        />
                      )}
                    </View>

                    {!!m.content && (
                      <Text style={[styles.slackMessageText, m.image_url ? { marginBottom: 4 } : {}]}>{m.content}</Text>
                    )}

                    {m.image_url && (
                      <DynamicChatImage
                        uri={m.image_url}
                        maxWidth={240}
                        onPress={() => setViewingImage(m.image_url!)}
                        style={{ marginTop: 2 }}
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: "#222", paddingBottom: Platform.OS === "android" ? 8 : 0 }}>
        {editingMessageId && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 4,
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 18, fontWeight: "500" }}>
              Editing
            </Text>
            <TouchableOpacity
              onPress={handleCancelEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}

        {pendingImage && !editingMessageId && (
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
          {!editingMessageId && (
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploading}
              style={{ justifyContent: "center", marginRight: 8 }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="add-circle-outline" size={34} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={editingMessageId ? "Edit message…" : "Message…"}
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
            <Ionicons
              name={editingMessageId ? "checkmark" : "send"}
              size={24}
              color={colors.accent}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>

      <ImageViewerModal
        uri={viewingImage}
        onClose={() => setViewingImage(null)}
      />

      <DeleteConfirmModal
        visible={showDeleteConfirm}
        onCancel={() => { setShowDeleteConfirm(false); setPendingDeleteMsg(null); }}
        onConfirm={confirmDelete}
        itemType="message"
      />
    </>
  );
}
