// login.tsx
import React, { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, Link } from "expo-router";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Dimensions,
} from "react-native";
import { useUser } from "../userContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUserId, setRoles } = useUser(); // ✅ context setters

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Sign in via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;
      if (user) {
        // 2. Save user ID in context
        await setUserId(user.id);

        // 3. Fetch role from `users` table
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData?.role) {
          await setRoles(profileData.role);
        }

        // 4. Redirect (all roles → same home for now)
        router.push('/(placemaker)/home');
    }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground} />
      <Pressable
        onPress={Platform.OS !== "web" ? Keyboard.dismiss : undefined}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.box}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../assets/wordmark.png')}
                    style={styles.wordmark}
                  />
                  <Text style={styles.title}> Login</Text>
                </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#a0a0a0"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                keyboardType="email-address"
                autoCapitalize="none"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              {/* Forgot Password Link */}
              <Link href="/forgotpassword" asChild>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Link>

              {isLoading ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              )}

              {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
              ) : null}

              <View style={styles.signupLinksContainer}>
                <Text style={styles.signupLink}>Don't have an account? Sign up as:</Text>
                  <Link href="/signup" asChild>
                    <Text style={styles.signupLinkText}>Sign Up</Text>
                  </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f0f7ff",
    borderTopWidth: Dimensions.get("window").height,
    borderTopColor: "#e6f3ff",
    borderLeftWidth: Dimensions.get("window").width,
    borderLeftColor: "#dceeff",
    transform: Platform.OS === "web" ? [{ rotate: "-10deg" }] : [],
    opacity: 0.95,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  wordmark: {
    width: 200,    // increase until it matches text height/width
    height: 60,    // tweak to match line height of your font
    resizeMode: 'cover',
    marginRight: 8, // spacing between logo and "Login"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
  },
  forgotPasswordText: {
    color: '#2e78b7',
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  error: {
    color: "red",
    marginTop: 8,
    textAlign: "center",
    fontSize: 16,
  },
  signupLinksContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  signupLink: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  signupLinkText: {
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 22,
    fontWeight: '500',
    marginVertical: 5,
  },
  loginButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default Login;
