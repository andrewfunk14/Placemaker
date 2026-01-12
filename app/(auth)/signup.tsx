// signup.tsx
import React, { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Keyboard,
} from "react-native";
import { useUser, UserRole } from "../userContext";
import { LinearGradient } from 'expo-linear-gradient';
import { authStyles as s } from "../../styles/authStyles";
import { cardShadow } from "../../styles/shadow";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["free"]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUserId, setRoles } = useUser();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage("");
    // setTimeout(() => setErrorMessage(""), 5000);
  };
  
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage("");
    // setTimeout(() => setSuccessMessage(""), 3000);
  };
  
  const handleSignup = async () => {
    setErrorMessage("");
    setSuccessMessage("");
  
    if (!name.trim()) return showError("Name is required");
    if (!email.trim()) return showError("Email is required");
    if (!password.trim()) return showError("Password is required");
    if (password.length < 6) return showError("Password must be at least 6 characters");
    if (password !== confirmPassword) return showError("Passwords do not match");
  
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, roles: ["free"] },
          emailRedirectTo: "http://localhost:8081/login",
        },
      });
  
      if (error) {
        const err = error.message || "Failed to sign up";
        if (
          err.includes("already registered") ||
          err.includes("duplicate key value") ||
          err.includes("User already registered")
        ) {
          return showError("This email is already registered");
        }
        return showError(err);
      }
  
      const user = data?.user;
      const identities = (user as any)?.identities ?? [];
  
      if (!user) {
        return showError("Signup failed — user was not created.");
      }
  
      if (identities.length === 0) {
        return showError("This email is already registered");
      }
  
      await setUserId(user.id);
      await setRoles(selectedRoles);
      showSuccess("Check email for confirmation link");
    } catch (err) {
      console.error("Unexpected signup error:", err);
      showError("Something went wrong creating your profile");
    } finally {
      setIsLoading(false);
    }
  };  
  
  return (
    <View style={s.pageContainer}>
      <LinearGradient
        colors={["#222222", "#0d0d0d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
  
      <Pressable
        onPress={Platform.OS !== "web" ? Keyboard.dismiss : undefined}
        style={{ flex: 1, pointerEvents: "auto" }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.pageContainer}
        >
          <ScrollView
            contentContainerStyle={s.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[s.card, cardShadow()]}>
              <View style={s.wordmarkContainer}>
                <Image
                  source={require("../../assets/dark-wordmark.png")}
                  style={s.wordmark}
                  // resizeMode="cover"
                />
              </View>
  
              <TextInput
                style={s.input}
                placeholder="Name"
                placeholderTextColor="#a0a0a0"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                keyboardAppearance="dark"
              />
  
              <TextInput
                ref={emailRef}
                style={s.input}
                placeholder="Email"
                placeholderTextColor="#a0a0a0"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                keyboardType="email-address"
                autoCapitalize="none"
                onSubmitEditing={() => passwordRef.current?.focus()}
                keyboardAppearance="dark"
              />
  
              <TextInput
                ref={passwordRef}
                style={s.input}
                placeholder="Password"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                keyboardAppearance="dark"
              />
  
              <TextInput
                ref={confirmPasswordRef}
                style={s.input}
                placeholder="Confirm Password"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                keyboardAppearance="dark"
              />
  
              <TouchableOpacity
                style={[s.primaryBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text style={s.primaryBtnText}>
                  {isLoading ? "Signing up..." : "Create Account"}
                </Text>
              </TouchableOpacity>
  
              {!!errorMessage && <Text style={s.error}>{errorMessage}</Text>}
              {!!successMessage && <Text style={s.success}>{successMessage}</Text>}
  
              <View style={s.footerRow}>
                <Text style={s.helperText}>Already have an account?</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    if (Platform.OS === "web") {
                      (e.currentTarget as unknown as HTMLElement).blur();
                    }
                    router.push("/login");
                  }}
                >
                  <Text style={s.link}>
                    Back to <Text style={[s.link, { fontWeight: "bold" }]}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </View>
  );
};

export default Signup;

