// resetpassword.tsx
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, Link } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { Dimensions } from 'react-native';

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
          // ✅ Web: Use window.location.href
          if (typeof window !== 'undefined') {
            url = window.location.href;
          }
        } else {
          // ✅ Mobile: Use Linking.getInitialURL()
          url = await Linking.getInitialURL() || '';
        }

        console.log("Full URL:", url);

        // ✅ Extract access_token from query params or hash fragment
        const searchParams = new URLSearchParams(new URL(url).search);
        const hashParams = new URLSearchParams(new URL(url).hash.substring(1));

        const token = searchParams.get('access_token') || hashParams.get('access_token');

        if (token) {
          console.log("Extracted Access Token:", token);
          setAccessToken(token);
        } else {
          console.warn("No access token found in URL.");
        }
      } catch (error) {
        console.error("Error extracting token:", error);
      }
    };

    extractToken();

    // ✅ Check if the user is already authenticated
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
        // ✅ Authenticated users → reset password directly
        console.log("Authenticated user - resetting password.");
        ({ error } = await supabase.auth.updateUser({
          password: newPassword,
        }));
      } else if (accessToken) {
        // ✅ Unauthenticated users → Must pass the access token
        console.log("Unauthenticated user - using access token.");

        // **Set the session with the extracted access token**
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '', // Not required for password reset
        });

        if (sessionError) {
          console.error("Error setting session:", sessionError.message);
          throw new Error("Session expired or invalid reset link");
        }

        console.log("Session set successfully. Proceeding with password reset.");

        // Now reset the password
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
      <View style={styles.gradientBackground} />
        <Pressable onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined} style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <View style={styles.box}>
                <Text style={styles.title}>Sanctum Reset Password</Text>

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
                  onChangeText={(text) => setConfirmPassword(text)}
                />

                {isLoading ? (
                  <ActivityIndicator size="large" color="#000" />
                ) : (
                  <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  </TouchableOpacity>
                )}
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.loginLink}>Back to <Text style={styles.boldLink}>Login</Text></Text>
                  </TouchableOpacity>
                </Link>
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
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e6f3ff', 
    borderTopWidth: Dimensions.get('window').height,
    borderTopColor: '#f0f7ff', 
    borderLeftWidth: Dimensions.get('window').width,
    borderLeftColor: '#dceeff',
    transform: Platform.OS === 'web' ? [{ rotate: '-10deg' }] : [],
    opacity: 0.95,
  },  
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    elevation: 5,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 20,
  },
  loginLink: {
    marginTop: 8,
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 22,
  },
  boldLink: {
    fontWeight: 'bold',
  },
});

export default ResetPassword;
