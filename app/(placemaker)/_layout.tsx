// (placemaker)/_layout.tsx
import { Platform, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useEffect } from "react";
import { Tabs, Stack, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MobileHeader from "../mobileHeader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { pushPath } from "../../store/slices/navigationSlice";

export default function PlacemakerLayout() {
  const router = useRouter();
  const segments = useSegments();
  const history = useAppSelector((state) => state.navigation.history);
  const currentPath = history[history.length - 1] || "/";
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (segments.length > 0) {
      const path = "/" + segments.join("/");
      dispatch(pushPath(path));
    }
  }, [segments]);

  if (Platform.OS === "web") {
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

          {/* Home */}
          <TouchableOpacity
            style={[styles.link, currentPath.startsWith("/(placemaker)/home") && styles.activeLink]}
            onPress={() => router.push("/(placemaker)/home")}
          >
            <Ionicons
              name="home-outline"
              size={24}
              color={currentPath.startsWith("/(placemaker)/home") ? "#FFD21F" : "#fff"}
            />
            <Text style={[styles.linkText, currentPath.startsWith("/(placemaker)/home") && styles.activeLinkText]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* Learn */}
          <TouchableOpacity
            style={[styles.link, currentPath.startsWith("/(placemaker)/(learn)") && styles.activeLink]}
            onPress={() => router.push("/(placemaker)/(learn)/learn")}
          >
            <Ionicons
              name="book-outline"
              size={24}
              color={currentPath.startsWith("/(placemaker)/(learn)") ? "#FFD21F" : "#fff"}
            />
            <Text style={[styles.linkText, currentPath.startsWith("/(placemaker)/(learn)") && styles.activeLinkText]}>
              Learn
            </Text>
          </TouchableOpacity>

          {/* Build */}
          <TouchableOpacity
            style={[styles.link, currentPath.startsWith("/(placemaker)/(build)") && styles.activeLink]}
            onPress={() => router.push("/(placemaker)/(build)/build")}
          >
            <Ionicons
              name="cube-outline"
              size={24}
              color={currentPath.startsWith("/(placemaker)/(build)") ? "#FFD21F" : "#fff"}
            />
            <Text style={[styles.linkText, currentPath.startsWith("/(placemaker)/(build)") && styles.activeLinkText]}>
              Build
            </Text>
          </TouchableOpacity>

          {/* Connect */}
          <TouchableOpacity
            style={[styles.link, currentPath.startsWith("/(placemaker)/(connect)") && styles.activeLink]}
            onPress={() => router.push("/(placemaker)/(connect)/connect")}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color={currentPath.startsWith("/(placemaker)/(connect)") ? "#FFD21F" : "#fff"}
            />
            <Text style={[styles.linkText, currentPath.startsWith("/(placemaker)/(connect)") && styles.activeLinkText]}>
              Connect
            </Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={[styles.link, currentPath.startsWith("/(placemaker)/profile") && styles.activeLink]}
            onPress={() => router.push("/(placemaker)/profile")}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={currentPath.startsWith("/(placemaker)/profile") ? "#FFD21F" : "#fff"}
            />
            <Text style={[styles.linkText, currentPath.startsWith("/(placemaker)/profile") && styles.activeLinkText]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    );
  }

  // mobile
  return (
    <View style={{ flex: 1 }}>
      <MobileHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FFD21F",
          tabBarInactiveTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#0d0d0d",
            borderTopColor: "#0d0d0d",
            height: 88,
            paddingBottom: 12,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="(learn)/learn" options={{ title: "Learn", tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="(build)/build" options={{ title: "Build", tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="(connect)/connect" options={{ title: "Connect", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 220,
    backgroundColor: "#0d0d0d",
    paddingTop: 12,
    paddingHorizontal: 10,
  },
  wordmarkContainer: {
    alignItems: "center",
    justifyContent: "center",
    // marginBottom: 4,
  },
  wordmark: {
    width: 200,
    height: 50,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  linkText: {
    color: "#fff",
    fontSize: 22,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#000",
  },
  activeLink: {
    // backgroundColor: "#222",
    borderRadius: 6,
  },
  activeLinkText: {
    color: "#FFD21F",
    fontWeight: "bold",
  },
});
