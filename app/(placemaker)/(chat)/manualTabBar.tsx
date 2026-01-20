// // (placemaker)/(chat)/manualTabBar.tsx
// import { View, TouchableOpacity, Text } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter, usePathname } from "expo-router";

// export default function ManualTabBar() {
//   const router = useRouter();
//   const pathname = usePathname();

//   const isActive = (match: string) => pathname.includes(match);

//   const tabs = [
//     {
//       label: "Home",
//       icon: "home-outline",
//       route: "/(placemaker)/(tabs)/home",
//       active: isActive("/home"),
//     },
//     {
//       label: "Learn",
//       icon: "book-outline",
//       route: "/(placemaker)/(tabs)/(learn)/learn",
//       active: isActive("/learn"),
//     },
//     {
//       label: "Build",
//       icon: "cube-outline",
//       route: "/(placemaker)/(tabs)/(build)/build",
//       active: isActive("/build"),
//     },
//     {
//       label: "Connect",
//       icon: "people-outline",
//       route: "/(placemaker)/(tabs)/(connect)/connect",
//       active:
//         pathname.includes("/connect") ||
//         pathname === "/chat" ||
//         pathname === "/dm",
//     },
//     {
//       label: "Profile",
//       icon: "person-outline",
//       route: "/(placemaker)/(tabs)/profile",
//       active: isActive("/profile"),
//     },
//   ];

//   return (
//     <View
//       style={{
//         flexDirection: "row",
//         backgroundColor: "#0d0d0d",
//         borderTopWidth: 1,
//         borderTopColor: "#0d0d0d",
//         height: 80,
//         paddingBottom: 12,
//       }}
//     >
//       {tabs.map((t) => (
//         <TouchableOpacity
//           key={t.label}
//           onPress={() => router.push(t.route)}
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             // paddingTop: 4,
//           }}
//         >
//           <Ionicons
//             name={t.icon as any}
//             size={24}
//             color={t.active ? "#FFD21F" : "#fff"}
//             style={{ marginBottom: 2 }}
//           />

//           <Text
//             style={{
//               color: t.active ? "#FFD21F" : "#fff",
//               fontSize: 16,
//               fontWeight: "600",
//             }}
//           >
//             {t.label}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

import { View, Pressable, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ManualTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (match: string) => pathname.includes(match);

  const tabs = [
    {
      label: "Home",
      icon: "home-outline",
      route: "/(placemaker)/(tabs)/home",
      active: isActive("/home"),
    },
    {
      label: "Learn",
      icon: "book-outline",
      route: "/(placemaker)/(tabs)/(learn)/learn",
      active: isActive("/learn"),
    },
    {
      label: "Build",
      icon: "cube-outline",
      route: "/(placemaker)/(tabs)/(build)/build",
      active: isActive("/build"),
    },
    {
      label: "Connect",
      icon: "people-outline",
      route: "/(placemaker)/(tabs)/(connect)/connect",
      active:
        pathname.includes("/connect") ||
        pathname.includes("/chat") ||
        pathname.includes("/dm"),
    },
    {
      label: "Profile",
      icon: "person-outline",
      route: "/(placemaker)/(tabs)/profile",
      active: isActive("/profile"),
    },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#0d0d0d",

        // 👇 SAFE AREA HANDLED HERE (and ONLY here)
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,

        // 👇 remove borders that cause visual seams
        borderTopWidth: 0,
      }}
    >
      {tabs.map((t) => (
        <Pressable
          key={t.label}
          onPress={() => router.push(t.route)}
          hitSlop={10}
          style={({ pressed }) => ({
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: 1, // ✅ never dim / outline
          })}
        >
          <Ionicons
            name={t.icon as any}
            size={24}
            color={t.active ? "#FFD21F" : "#ffffff"}
            style={{ marginBottom: 2 }}
          />

          <Text
            style={{
              color: t.active ? "#FFD21F" : "#ffffff",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
