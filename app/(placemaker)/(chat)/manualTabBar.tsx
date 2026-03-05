// (placemaker)/(chat)/manualTabBar.tsx
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
        height: Platform.OS === "web" ? 0 : 60 + insets.bottom,
        paddingTop: 8,
        paddingBottom: Platform.OS === "web" ? 0 : insets.bottom,        
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
            opacity: 1,
          })}
        >
          <Ionicons
            name={t.icon as any}
            size={26}
            color={t.active ? "#FFD21F" : "#f5f5f5"}
            style={{ marginBottom: 2 }}
          />

          <Text
            style={{
              color: t.active ? "#FFD21F" : "#f5f5f5",
              fontSize: 15,
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
