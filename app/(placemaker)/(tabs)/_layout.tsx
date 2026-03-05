// app/(placemaker)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MobileHeader from "../../mobileHeader";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS !== "web" && <MobileHeader />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FFD21F",
          tabBarInactiveTintColor: "#f5f5f5",
          tabBarStyle: {
            backgroundColor: "#0d0d0d",
            borderTopColor: "#0d0d0d",
            height: Platform.OS === "web" ? 0 : 60 + insets.bottom,
            paddingBottom: Platform.OS === "web" ? 0 : insets.bottom,
            paddingTop: Platform.OS === "web" ? 0 : 4,
            display: Platform.OS === "web" ? "none" : "flex",
          },
          tabBarLabelStyle: { fontSize: 16, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(learn)/learn"
          options={{
            title: "Learn",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(build)/build"
          options={{
            title: "Build",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(connect)/connect"
          options={{
            title: "Connect",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
