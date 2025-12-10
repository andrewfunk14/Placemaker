// (placemaker)/(chat)/dm.tsx
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import DirectMessageChat from "./directMessageChat";
import ManualTabBar from "./manualTabBar";

export default function DirectMessageScreen() {
  const { userId: partnerId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

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

  const title = partnerName || "Message";

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title,
          headerStyle: { backgroundColor: "#1a1a1a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontSize: 20, fontWeight: "700" },

          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                router.replace("/(placemaker)/(tabs)/(connect)/connect")
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: "#1a1a1a",
          paddingBottom: Platform.OS === "ios" ? 4 : 0,
        }}
      >
        {partnerId && <DirectMessageChat partnerId={partnerId} />}
        {Platform.OS !== "web" && <ManualTabBar />}
      </View>
    </View>
  );
}
