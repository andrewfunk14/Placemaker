// (placemaker)/home.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useUser } from "../userContext"; // updated hook
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {
  const { roles, userId, setRoles, setUserId } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setRoles(["placemaker"]); // reset to default
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Placemakers!</Text>
      <Text style={styles.subtitle}>
        {roles.length > 0
          ? `You are logged in as: ${roles.join(", ")}`
          : "Loading..."}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
