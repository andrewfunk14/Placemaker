// (placemaker)/profile.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useUser } from "../userContext";
import { router } from "expo-router";

export default function Profile() {
  const { roles } = useUser();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Page</Text>
    </View>
  );
}
