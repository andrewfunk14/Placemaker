// (placemaker)/(chat)/chat.tsx
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../../../store/hooks/hooks";
import GroupChat from "./groupChat";
import ManualTabBar from "./manualTabBar";
import { supabase } from "../../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const reduxGroups = useAppSelector((state) => state.groups.groups);
  const reduxGroup = reduxGroups.find((g) => g.id === groupId);

  const [fallbackName, setFallbackName] = useState<string>("");

  useEffect(() => {
    if (reduxGroup) return;

    supabase
      .from("groups")
      .select("name")
      .eq("id", groupId as string)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setFallbackName(data.name);
      });
  }, [reduxGroup, groupId]);

  const title = reduxGroup?.name || fallbackName;

  return (
    <View style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
      {/* Disable native header */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ Custom header with SAFE AREA */}
      <View
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop: Platform.OS === "ios" ? insets.top : 12,
          paddingBottom: 8,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() =>
            router.replace("/(placemaker)/(tabs)/(connect)/connect")
          }
          hitSlop={12}
          style={{ padding: 4 }}
        >
          <Ionicons name="chevron-back" size={28} color="#f5f5f5" />
        </Pressable>

        <Text
          style={{
            color: "#f5f5f5",
            fontSize: 20,
            fontWeight: "700",
            marginLeft: 8,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Chat */}
      <View style={{ flex: 1 }}>
        <GroupChat groupId={groupId as string} />
      </View>

      {/* Bottom tab bar */}
      {Platform.OS !== "web" && <ManualTabBar />}
    </View>
  );
}
