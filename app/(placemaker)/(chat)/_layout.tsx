// (placemaker)/(chat)/_layout.tsx
import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        presentation: "card",
      }}
    >
      <Stack.Screen
        name="chat"
        options={{
          headerShown: true,
          title: "Message",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
