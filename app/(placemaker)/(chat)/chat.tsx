// (placemaker)/(chat)/chat.tsx
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../../../store/hooks";
import GroupChat from "./groupChat";

export default function ChatScreen() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();

  const groups = useAppSelector((state) => state.groups.groups);
  const group = groups.find((g) => g.id === groupId);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Stack.Screen
        options={{
          title: group?.name ?? "Chat",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontSize: 20, fontWeight: "700" },

          /** Back button on ALL platforms */
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
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

          /** 🔥 CRITICAL: Avoid the header overlapping the chat */
          contentStyle: {
            flex: 1,
            backgroundColor: "#000",
          },
        }}
      />

      {/* 🔥 CRITICAL: This wrapper MUST be flex:1 for iOS scroll to work */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#0d0d0d",
          paddingBottom: Platform.OS === "ios" ? 4 : 0, // helps prevent scroll clamp
        }}
      >
        <GroupChat groupId={groupId as string} />
      </View>
    </View>
  );
}
