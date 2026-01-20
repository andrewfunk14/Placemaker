// // (placemaker)/(chat)/chat.tsx
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import { View, TouchableOpacity, Platform } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppSelector } from "../../../store/hooks/hooks";
// import GroupChat from "./groupChat";
// import ManualTabBar from "./manualTabBar";
// import { supabase } from "../../../lib/supabaseClient";
// import { useEffect, useState } from "react";

// export default function ChatScreen() {
//   const { groupId } = useLocalSearchParams();
//   const router = useRouter();

//   const reduxGroups = useAppSelector((state) => state.groups.groups);
//   const reduxGroup = reduxGroups.find((g) => g.id === groupId);

//   const [fallbackName, setFallbackName] = useState<string>("");

//   useEffect(() => {
//     if (reduxGroup) return;

//     supabase
//       .from("groups")
//       .select("name")
//       .eq("id", groupId as string)
//       .maybeSingle()
//       .then(({ data }) => {
//         if (data?.name) setFallbackName(data.name);
//       });
//   }, [reduxGroup, groupId]);

//   const title = reduxGroup?.name || fallbackName;

//   return (
//     <View style={{ flex: 1 }}>
//       <Stack.Screen
//         options={{
//           title,
//           headerStyle: { backgroundColor: "#1a1a1a" },
//           headerTintColor: "#fff",
//           headerTitleStyle: { fontSize: 20, fontWeight: "700" },

//           headerLeft: () => (
//             <TouchableOpacity
//               onPress={() =>
//                 router.replace("/(placemaker)/(tabs)/(connect)/connect")
//               }
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 paddingHorizontal: 10,
//                 paddingVertical: 6,
//               }}
//             >
//               <Ionicons name="chevron-back" size={28} color="#fff" />
//             </TouchableOpacity>
//           ),

//           contentStyle: { flex: 1 },
//         }}
//       />

//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "#1a1a1a",
//           // paddingBottom: Platform.OS === "ios" ? 4 : 0,
//         }}
//       >
//         <GroupChat groupId={groupId as string} />
//         {Platform.OS !== "web" && <ManualTabBar />}
//       </View>
//     </View>
//   );
// }

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
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>

        <Text
          style={{
            color: "#fff",
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
