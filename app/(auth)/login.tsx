// login.tsx
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { useUser } from "../userContext";
import { LinearGradient } from 'expo-linear-gradient';
import { authStyles as s } from "../../styles/authStyles";
import { cardShadow } from "../../styles/shadow";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUserId, setRoles } = useUser();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      emailRef.current?.focus();
    }
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;
      if (user) {
        await setUserId(user.id);

        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("roles, email")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData?.roles) {
          await setRoles(profileData.roles);
        }

        router.push('/(placemaker)/home');
    }
    } catch (error: any) {
      setErrorMessage("Email or Password is incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.pageContainer}>
      <LinearGradient
        colors={['#222222', '#0d0d0d']}
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
                source={
                  Platform.OS === "web"
                    ? require("../../assets/dark-wordmark.svg")
                    : require("../../assets/dark-wordmark.png")
                }
                style={s.wordmark}
                resizeMode="cover"
              />
            </View>
              <TextInput
                style={s.input}
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
                style={s.input}
                placeholder="Password"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity
                style={s.forgotLinkBtn}
                onPress={(e) => {
                  if (Platform.OS === "web") {
                    (e.currentTarget as unknown as HTMLElement).blur();
                  }
                  router.push("/forgotpassword");
                }}
              >
                <Text style={s.link}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.primaryBtn, isLoading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={isLoading}
              >
                <Text style={s.primaryBtnText}>
                  {isLoading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              {errorMessage ? (
                <Text style={s.error}>{errorMessage}</Text>
              ) : null}

              <View style={s.footerRow}>
                <Text style={s.helperText}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      if (Platform.OS === "web") {
                        (e.currentTarget as unknown as HTMLElement).blur();
                      }
                      router.push("/signup");
                    }}
                  >                  
                  <Text style={s.link}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </View>
  );
};

export default Login;
