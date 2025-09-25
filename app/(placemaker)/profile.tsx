// (placemaker)/profile.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useUser } from "../userContext";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabaseClient";

export default function Profile() {
  const { roles, userId, setRoles, setUserId } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setRoles(["placemaker"]);
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Profile</Text>
      <Text style={styles.subtitle}>
        {roles.length > 0
          ? `You are logged in as: ${roles.join(", ")}`
          : "Loading..."}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#2e78b7", marginTop: 12 }]}
        onPress={() => {
          if (Platform.OS === "web" && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          router.push("/resetpassword");
        }}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 32,
    textAlign: "center",
    color: "#fff",
  },
  button: {
    backgroundColor: "#DC3545",
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
