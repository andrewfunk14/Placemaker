// forgotpassword.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  View,
  Text,
  Image,
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
import { LinearGradient } from 'expo-linear-gradient';

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
      <LinearGradient
        colors={['#2c2c2c', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Pressable onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.box}>
              <View style={styles.wordmarkContainer}>
                <Image
                  source={require('../../assets/dark-wordmark.png')}
                  style={styles.wordmark}
                />
              </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#a0a0a0"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  returnKeyType="done"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onSubmitEditing={Keyboard.dismiss}
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  wordmarkContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24, 
  },  
  wordmark: {
    width: 350,      
    height: 50,         
    resizeMode: "cover",
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
  success: {
    color: 'green',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 24,
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 24,
  },
  loginLink: {
    marginTop: 16,
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 24,
  },
  boldLink: {
    fontWeight: 'bold',
  },
});

export default ForgotPassword;

