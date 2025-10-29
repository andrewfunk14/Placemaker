// resetpassword.tsx
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authStyles as s } from "../../styles/authStyles";
import { cardShadow } from "../../styles/shadow";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const router = useRouter();

  useEffect(() => {
    const extractToken = async () => {
      try {
        let url = '';
  
        if (Platform.OS === 'web') {
          url = typeof window !== 'undefined' ? window.location.href : '';
        } else {
          url = (await Linking.getInitialURL()) || '';
        }
  
        if (!url) return;
  
        const searchParams = new URLSearchParams(new URL(url).search);
        const hashParams = new URLSearchParams(new URL(url).hash.substring(1));
  
        const token = searchParams.get('access_token') || hashParams.get('access_token');
  
        if (token) {
          console.log("Extracted Access Token:", token);
          setAccessToken(token);
        } 
      } catch (error) {
        console.error("Error extracting token:", error);
      }
    };
  
    extractToken();  

    const checkUser = async () => {
      try {
        const { data: user, error } = await supabase.auth.getUser();
        if (error || !user?.user) {
          console.log("User is NOT authenticated.");
          setIsAuthenticated(false);
        } else {
          console.log("User is authenticated.");
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error checking user authentication:", err);
      }
    };

    checkUser();
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage('Missing required fields');
      return;
    }
  
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
  
    if (!isAuthenticated && !accessToken) {
      setErrorMessage('Invalid or expired reset link');
      return;
    }
  
    setIsLoading(true);
    setErrorMessage('');
      
    try {
      let error;

      if (isAuthenticated) {
        console.log("Authenticated user - resetting password.");
        ({ error } = await supabase.auth.updateUser({
          password: newPassword,
        }));
      } else if (accessToken) {
        console.log("Unauthenticated user - using access token.");

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });

        if (sessionError) {
          console.error("Error setting session:", sessionError.message);
          throw new Error("Session expired or invalid reset link");
        }

        console.log("Session set successfully. Proceeding with password reset.");

        ({ error } = await supabase.auth.updateUser({
          password: newPassword,
        }));
      } else {
        throw new Error('Invalid or expired reset link');
      }

      if (error) throw error;

      Alert.alert('Success', 'Your password has been reset.');
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
          } catch (error: any) {
            if (
              error.message.includes('New password should be different')
            ) {
              setErrorMessage('Your new password must be different from the old one');
            } else {
              setErrorMessage('Failed to reset password. Please try again.');
            }            
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
                placeholder="New Password"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                value={newPassword}
                returnKeyType="next"
                onChangeText={setNewPassword}
                onSubmitEditing={() => passwordRef.current?.focus()}
                keyboardAppearance="dark"
              />
  
              <TextInput
                ref={passwordRef}
                style={s.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                value={confirmPassword}
                returnKeyType="done"
                onChangeText={setConfirmPassword}
                keyboardAppearance="dark"
              />
  
              <TouchableOpacity
                style={[s.primaryBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={s.primaryBtnText}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
  
              {!!errorMessage && <Text style={s.error}>{errorMessage}</Text>}
  
              <TouchableOpacity
                style={s.ghostBtn}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </View>
  );
};

export default ResetPassword;
