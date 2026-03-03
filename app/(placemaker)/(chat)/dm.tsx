// (placemaker)/(chat)/dm.tsx
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import DirectMessageChat from "./directMessageChat";
import ManualTabBar from "./manualTabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DirectMessageScreen() {
  const { userId: partnerId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [partnerName, setPartnerName] = useState("");

  useEffect(() => {
    if (!partnerId) return;

    supabase
      .from("profiles")
      .select("name")
      .eq("id", partnerId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setPartnerName(data.name);
      });
  }, [partnerId]);

  const title = partnerName;

  return (
    <View style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
      {/* Disable native header */}
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop: Platform.OS === "ios" ? insets.top : 12,
          paddingVertical: 12,
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
        {partnerId && <DirectMessageChat partnerId={partnerId} />}
      </View>

      {/* Bottom tab bar */}
      {Platform.OS !== "web" && <ManualTabBar />}
    </View>
  );
}
