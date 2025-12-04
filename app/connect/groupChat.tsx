// components/connect/GroupChat.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
  Platform,
} from "react-native";
import { connectStyles as styles, colors } from "../../styles/connectStyles";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchGroupMessages,
  sendGroupMessage,
  messageReceived,
  GroupMessage,
} from "../../store/slices/groupMessagesSlice";
import { useUser } from "../userContext";
import { supabase } from "../../lib/supabaseClient";

interface GroupChatProps {
  groupId: string;
}

export default function GroupChat({ groupId }: GroupChatProps) {
  const dispatch = useAppDispatch();
  const { userId } = useUser();

  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState("");

  const messages =
    useAppSelector(
      (state) => state.groupMessages.messagesByGroupId[groupId] || []
    ) ?? [];

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 40);
  }, [messages]);

  useEffect(() => {
    dispatch(fetchGroupMessages(groupId));
  }, [groupId]);

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

  const handleSend = () => {
    if (!text.trim()) return;
    dispatch(sendGroupMessage({ groupId, content: text }));
    setText("");
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDayHeader = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Pressable
      onPress={Platform.OS !== "web" ? Keyboard.dismiss : undefined}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollRef}
            style={styles.messagesList}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((m, i) => {

              const name = m.profiles?.name ?? "Unknown";
              const avatar = m.profiles?.avatar_url ?? null;
              const currentDay = formatDayHeader(m.created_at);
              const previousDay =
                i > 0 ? formatDayHeader(messages[i - 1].created_at) : null;

              const showDayHeader = currentDay !== previousDay;

              return (
                <View key={m.id}>
                  {showDayHeader && (
                    <View style={styles.dayHeaderWrapper}>
                      <View style={styles.dayHeaderLine} />
                      <Text style={styles.dayHeaderText}>{currentDay}</Text>
                      <View style={styles.dayHeaderLine} />
                    </View>
                  )}

                  <View style={styles.messageRow}>
                      <View style={styles.avatarWrapper}>
                        {avatar ? (
                          <Image source={{ uri: avatar }} style={styles.messageAvatar} />
                        ) : (
                          <View style={styles.messageAvatarFallback}>
                            <Text style={styles.fallbackText}>
                              {name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>

                    <View style={styles.messageContentBlock}>
                        <Text style={styles.messageSender}>{name}</Text>

                      <Text style={styles.slackMessageText}>{m.content}</Text>

                      <Text style={styles.messageTimestamp}>
                        {formatTime(m.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.messageInputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message…"
              placeholderTextColor={colors.placeholderText}
              style={styles.messageInput}
              keyboardAppearance="dark"
              onKeyPress={(e) => {
                const key = e.nativeEvent.key;

                if (Platform.OS === "web") {
                  const shift = (e as any).shiftKey;
                  if (key === "Enter" && !shift) {
                    e.preventDefault?.();
                    handleSend();
                  }
                }
              }}
            />

            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Pressable>
  );
}
