// forgotpassword.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Dimensions } from 'react-native';

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
      setErrorMessage('Please enter your email address');
      setIsLoading(false);
      return;
    }
  
    try {
      console.log("Sending password reset request for:", email);
  
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://www.sanctum.blue/resetpassword?type=recovery'
      });
  
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
  
      setMessage('A password reset link has been sent to your email');
    } catch (error: any) {
      console.error("Error in handleForgotPassword:", error.message);
      setErrorMessage(error.message || 'Failed to send password reset email');
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
                <Text style={styles.title}>Sanctum Forgot Password</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#a0a0a0"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  returnKeyType="done"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when pressing "Enter"
                />

                {isLoading ? (
                  <ActivityIndicator size="large" color="#000" />
                ) : (
                  <TouchableOpacity style={styles.resetButton} onPress={handleForgotPassword}>
                    <Text style={styles.resetButtonText}>Send Password Link</Text>
                  </TouchableOpacity>
                )}

                {message ? <Text style={styles.success}>{message}</Text> : null}
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                {/* Link to return to the login page */}
                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.loginLink}>
                      Back to <Text style={[styles.loginLink, styles.boldLink]}>Login</Text>
                    </Text>
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
    fontSize: Platform.OS === 'web' ? 26 : 24,
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
    // marginTop: 10,
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  success: {
    color: 'green',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 20,
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

export default ForgotPassword;

