// forgotpassword.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authStyles as s } from "../../styles/authStyles";
import { cardShadow } from "../../styles/shadow";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setMessage('');
  
    if (!email.trim()) {
      setErrorMessage('Please enter email address');
      setIsLoading(false);
      return;
    }
  
    try {
      console.log("Sending password reset request for:", email);
  
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: Platform.OS === "web"
        ? "https://joinplacemaker.com/resetpassword"
        : "placemaker://resetpassword",
      });
  
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
  
      setMessage('Check email for reset link');
    } catch (error: any) {
      console.error("Error in handleForgotPassword:", error.message);
      setErrorMessage(error.message || 'Failed to send password reset email');
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
          behavior="padding"
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
                />
              </View>
  
              <TextInput
                style={s.input}
                placeholder="Email"
                placeholderTextColor="#a0a0a0"
                value={email}
                onChangeText={setEmail}
                returnKeyType="done"
                keyboardType="email-address"
                autoCapitalize="none"
                onSubmitEditing={handleForgotPassword}
                keyboardAppearance="dark"
              />
  
              <Pressable
                style={(state: any) => [
                  s.primaryBtn,
                  state.hovered && { opacity: 0.8 },
                  state.pressed && { opacity: 0.8 },
                ]}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={s.primaryBtnText}>
                  {isLoading ? "Sending..." : "Send Password Link"}
                </Text>
              </Pressable>
  
              {!!message && <Text style={s.success}>{message}</Text>}
              {!!errorMessage && <Text style={s.error}>{errorMessage}</Text>}
                <View style={s.footerRow}>
                  <Pressable
                    onPress={(e) => {
                      if (Platform.OS === "web") {
                        (e.currentTarget as unknown as HTMLElement).blur();
                      }
                      router.push("/login");
                    }}
                    style={(state) => {
                      const hovered = (state as any).hovered;
                      return [
                        hovered && Platform.OS === "web" && { opacity: 0.8 },
                      ];
                    }}
                  >
                  <Text style={s.link}>
                    Back to <Text style={[s.link, { fontWeight: "bold" }]}>Login</Text>
                  </Text>                  
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </View>
  );
};

export default ForgotPassword;

