// (placemaker)/(chat)/_layout.tsx
import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        presentation: "card",
        headerStyle: { backgroundColor: "#1a1a1a" },
        headerTintColor: "#fff",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="chat"
        options={{
          headerShown: true,
          title: "Group Chat",
        }}
      />

      <Stack.Screen
        name="dm"
        options={{
          headerShown: true,
          title: "Direct Message",
        }}
      />
    </Stack>
  );
}
