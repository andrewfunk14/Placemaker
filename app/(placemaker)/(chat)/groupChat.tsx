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
} from "react-native";
import { connectStyles as styles, colors } from "../../../styles/connectStyles";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchGroupMessages,
  sendGroupMessage,
  messageReceived,
  GroupMessage,
} from "../../../store/slices/groupMessagesSlice";
import { useUser } from "../../userContext";
import { supabase } from "../../../lib/supabaseClient";

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
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  /** Load messages */
  useEffect(() => {
    dispatch(fetchGroupMessages(groupId));
  }, [groupId]);

  /** Scroll when new messages arrive */
  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [messages]);

  /** Keyboard opens → auto-scroll */
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", scrollToBottom);
    return () => showSub.remove();
  }, []);

  /** Realtime listener */
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
      supabase.removeChannel(channel); // <-- SYNC cleanup
    };
  }, [groupId]);  

  const handleSend = () => {
    if (!text.trim()) return;
    dispatch(sendGroupMessage({ groupId, content: text }));
    setText("");
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

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, paddingHorizontal: 16 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
          
          {/* SCROLLING CHAT AREA */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            onContentSizeChange={scrollToBottom}
            contentContainerStyle={{
              paddingBottom: 12,
              paddingTop: 12,
            }}
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
    
          {/* INPUT BAR */}
          <View style={styles.messageInputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message…"
              placeholderTextColor={colors.placeholderText}
              style={styles.messageInput}
              keyboardAppearance="dark"
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
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
    
        </KeyboardAvoidingView>
    );    
}
