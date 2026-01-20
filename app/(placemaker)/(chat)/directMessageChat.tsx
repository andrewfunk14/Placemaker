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
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { connectStyles as styles, colors } from "../../../styles/connectStyles";
import { supabase } from "../../../lib/supabaseClient";
import {
  fetchDMs,
  sendDM,
  makeSelectDMsByThread,
} from "../../../store/slices/dmSlice";

export default function DirectMessageChat({ partnerId }: { partnerId: string }) {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<ScrollView>(null);

  const [text, setText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setMyId(uid);
      if (uid && partnerId) {
        setThreadId([uid, partnerId].sort().join("_"));
      }
    });
  }, [partnerId]);


  const EMPTY: any[] = [];

  const selectMessages = useMemo(() => {
    if (!threadId) return () => EMPTY;
    return makeSelectDMsByThread(threadId);
  }, [threadId]);  

  const messages = useAppSelector(selectMessages);

  useEffect(() => {
    if (!partnerId) return;

    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", partnerId)
      .maybeSingle()
      .then(({ data }) => setPartner(data));
  }, [partnerId]);

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

  const handleSend = () => {
    if (!text.trim()) return;

    dispatch(
      sendDM({ threadId, senderId: myId, receiverId: partnerId, content: text })
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
      >
        {messages.map((m, i) => {
          const mine = m.sender_id === myId;
          const day = formatDay(m.created_at);
          const prevDay = i > 0 ? formatDay(messages[i - 1].created_at) : null;
          const showHeader = day !== prevDay;

          return (
            <View key={m.id}>
              {showHeader && (
                <View style={styles.dayHeaderWrapper}>
                  <View style={styles.dayHeaderLine} />
                  <Text style={styles.dayHeaderText}>{day}</Text>
                  <View style={styles.dayHeaderLine} />
                </View>
              )}

              <View
                style={[
                  styles.messageRow,
                  { justifyContent: mine ? "flex-end" : "flex-start" },
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    mine ? styles.myMessageBubble : styles.theirMessageBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      // mine ? styles.myMessageText : styles.theirMessageText,
                    ]}
                  >
                    {m.content}
                  </Text>

                  <Text
                    style={[
                      styles.messageTimestamp,
                      mine ? styles.myMessageTimestamp : styles.theirMessageTimestamp,
                    ]}
                  >
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
          keyboardAppearance="dark"
          style={[
            styles.messageInput,
            {
              color: "#fff",
              borderWidth: 1,
              borderColor: colors.translucentBorder,
              borderRadius: 8,
              paddingHorizontal: 12,
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

        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
