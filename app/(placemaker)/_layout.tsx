// app/(placemaker)/_layout.tsx
import { Platform, View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { pushPath } from "../../store/slices/navigationSlice";

export default function PlacemakerLayout() {
  const router = useRouter();
  const segments = useSegments();
  const history = useAppSelector(s => s.navigation.history);
  const currentPath = history[history.length - 1] || "/";
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (segments.length > 0) {
      const path = "/" + segments.join("/");
      dispatch(pushPath(path));
    }
  }, [segments]);

  if (Platform.OS === "web") {
    // WEB: sidebar + a Stack that renders the (tabs) group (tab bar will be hidden in tabs layout)
    return (
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <View style={styles.wordmarkContainer}>
            <Image
              source={require("../../assets/dark-wordmark.svg")}
              style={styles.wordmark}
              resizeMode="cover"
            />
          </View>

          <NavLink
            label="Home"
            icon="home-outline"
            active={currentPath.startsWith("/(placemaker)/(tabs)/home")}
            onPress={() => router.push("/(placemaker)/(tabs)/home")}
          />
          <NavLink
            label="Learn"
            icon="book-outline"
            active={currentPath.startsWith("/(placemaker)/(tabs)/(learn)")}
            onPress={() => router.push("/(placemaker)/(tabs)/(learn)/learn")}
          />
          <NavLink
            label="Build"
            icon="cube-outline"
            active={currentPath.startsWith("/(placemaker)/(tabs)/(build)")}
            onPress={() => router.push("/(placemaker)/(tabs)/(build)/build")}
          />
          <NavLink
            label="Connect"
            icon="people-outline"
            active={currentPath.startsWith("/(placemaker)/(tabs)/(connect)")}
            onPress={() => router.push("/(placemaker)/(tabs)/(connect)/connect")}
          />
          <NavLink
            label="Profile"
            icon="person-outline"
            active={currentPath.startsWith("/(placemaker)/(tabs)/profile")}
            onPress={() => router.push("/(placemaker)/(tabs)/profile")}
          />
        </View>

        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </View>
    );
  }

  // MOBILE: do NOT render MobileHeader here. Let the Tabs layout own the mobile UI.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function NavLink({
  label, icon, active, onPress,
}: { label: string; icon: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.link, active && styles.activeLink]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? "#FFD21F" : "#fff"} />
      <Text style={[styles.linkText, active && styles.activeLinkText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", cursor: "auto" },
  sidebar: { width: 250, backgroundColor: "#0d0d0d", paddingTop: 12, paddingHorizontal: 10 },
  wordmarkContainer: { alignItems: "center", justifyContent: "center" },
  wordmark: { width: 230, height: 55 },
  link: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8 },
  linkText: { color: "#fff", fontSize: 22, marginLeft: 8 },
  activeLink: { borderRadius: 6 },
  activeLinkText: { color: "#FFD21F", fontWeight: "bold" },
  content: { flex: 1, backgroundColor: "#000" },
});
