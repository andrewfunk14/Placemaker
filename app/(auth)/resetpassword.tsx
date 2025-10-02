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
    <View style={styles.container}>
      <LinearGradient
        colors={['#222222', '#0d0d0d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
        <Pressable onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}   style={{ flex: 1, pointerEvents: "auto" }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <View style={styles.box}>
                <View style={styles.wordmarkContainer}>
                  {/* <Image
                    source={require('../../assets/dark-wordmark.svg')}
                    style={styles.wordmark}
                    resizeMode="cover"
                  /> */}
                  <Image
                    source={
                      Platform.OS === "web"
                        ? require("../../assets/dark-wordmark.svg")
                        : require("../../assets/dark-wordmark.png")
                    }
                    style={styles.wordmark}
                    resizeMode="cover"
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#a0a0a0"
                  secureTextEntry
                  value={newPassword}
                  returnKeyType="next"
                  onChangeText={(text) => setNewPassword(text)}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />

                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#a0a0a0"
                  secureTextEntry
                  value={confirmPassword}
                  returnKeyType="done"
                  onChangeText={(text) => setConfirmPassword(text)}
                />
                <TouchableOpacity
                  style={[styles.resetButton, isLoading && { opacity: 0.7 }]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                  <Text style={styles.resetButtonText}>
                    {isLoading ? "Resseting..." : "Reset Password"}
                  </Text>
                </TouchableOpacity>

                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={(e) => {
                    if (Platform.OS === "web") {
                      (e.currentTarget as unknown as HTMLElement).blur();
                    }
                    router.push("/login");
                  }}
                >                    
                  <Text style={styles.loginLink}>Back to <Text style={styles.boldLink}>Login</Text></Text>
                </TouchableOpacity>
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
    backgroundColor: 'transparent',
    cursor: 'auto',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderColor: "#ffd21f",
    borderWidth: 2,
    elevation: 5,
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
  },
  wordmarkContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, 
  },  
  wordmark: {
    width: 250,      
    height: 40,         
  },    
  input: {
    height: 48,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  resetButton: {
    backgroundColor: "#ffd21f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  resetButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 24,
  },
  error: {
    color: "#ff4d4f",
    marginTop: 16,
    textAlign: 'center',
    fontSize: 24,
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  loginLink: {
    marginTop: 4,
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 24,
  },
  boldLink: {
    fontWeight: 'bold',
  },
});

export default ResetPassword;
