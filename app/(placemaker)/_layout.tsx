// app/(placemaker)/_layout.tsx
import { Platform, View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { pushPath, resetHistory } from "../../store/slices/navigationSlice";
import { supabase } from "../../lib/supabaseClient";
import { signOut } from "../../store/slices/authSlice";
import { clearProfile } from "../../store/slices/profileSlice";

export default function PlacemakerLayout() {
  const router = useRouter();
  const segments = useSegments();
  const history = useAppSelector((s) => s.navigation.history);
  const currentPath = history[history.length - 1] || "/";
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (segments.length > 0) {
      const path = "/" + segments.join("/");
      dispatch(pushPath(path));
    }
  }, [segments]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(signOut());
      dispatch(clearProfile());
      dispatch(resetHistory());
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {/* --- Sidebar --- */}
        <View style={styles.sidebar}>
          <View style={styles.wordmarkContainer}>
            <Image
              source={require("../../assets/dark-wordmark.svg")}
              style={styles.wordmark}
              resizeMode="cover"
            />
          </View>

          {/* --- Nav Links --- */}
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

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={32} color="#ff4d4f" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(chat)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(chat)" />
    </Stack>
  );
}

function NavLink({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.link, active && styles.activeLink]} onPress={onPress}>
      <Ionicons name={icon} size={28} color={active ? "#FFD21F" : "#fff"} />
      <Text style={[styles.linkText, active && styles.activeLinkText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    flexDirection: "row", 
    cursor: "auto" 
  },
  sidebar: {
    width: 250,
    backgroundColor: "#0d0d0d",
    paddingTop: 12,
    paddingHorizontal: 10,
    justifyContent: "flex-start",
  },
  wordmarkContainer: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  wordmark: { 
    width: 230, 
    height: 55 
  },
  link: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 12, 
    paddingHorizontal: 8 
  },
  linkText: { 
    color: "#fff", 
    fontSize: 26, 
    marginLeft: 12 
  },
  activeLink: { 
    borderRadius: 6 
  },
  activeLinkText: { 
    color: "#FFD21F", 
    fontWeight: "bold" 
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  logoutText: {
    color: "#ff4d4f",
    fontSize: 26,
    marginLeft: 8,
    fontWeight: "500",
  },
  content: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
});
