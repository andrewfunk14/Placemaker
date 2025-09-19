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
} from "react-native";
import { useUser } from "../userContext";
import { LinearGradient } from 'expo-linear-gradient';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUserId, setRoles } = useUser();

  const passwordRef = useRef<TextInput>(null);

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
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData?.role) {
          await setRoles(profileData.role);
        }

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
      <LinearGradient
        colors={['#2c2c2c', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
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
              <View style={styles.wordmarkContainer}>
                <Image
                  source={require('../../assets/dark-wordmark.png')}
                  style={styles.wordmark}
                />
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

              <Link href="/forgotpassword" asChild>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Link>

              {isLoading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              )}

              {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
              ) : null}

              <View style={styles.signupLinksContainer}>
                <Text style={styles.whiteText}>Don't have an account?</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
  },
  forgotPasswordText: {
    color: '#2e78b7',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginTop: 8,
    textAlign: "center",
    fontSize: 24,
  },
  signupLinksContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  whiteText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  signupLinkText: {
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  loginButton: {
    backgroundColor: "#ffd21f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  loginButtonText: {
    color: "black",
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default Login;
