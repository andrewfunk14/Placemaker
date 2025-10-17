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
  
      // 1) If Supabase reports an error, show it.
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
  
      // 2) No error: check identities array to detect duplicate.
      const user = data?.user;
      const identities = (user as any)?.identities ?? [];
  
      if (!user) {
        // nothing created on Supabase => treat as error
        return showError("Signup failed — user was not created.");
      }
  
      if (identities.length === 0) {
        // Supabase’s silent duplicate case
        return showError("This email is already registered");
      }
  
      // 3) Success path (Supabase actually created a new user + sent email)
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
    <View style={styles.container}>
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
            style={styles.container}
        >
            <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            >
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
                placeholder="Your Name"
                placeholderTextColor="#a0a0a0"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
              <TextInput
                ref={emailRef}
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
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <TouchableOpacity
                style={[styles.signUpButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text style={styles.signUpButtonText}>
                    {isLoading ? "Signing up..." : "Sign Up"}
                </Text>
              </TouchableOpacity>

                {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
                ) : null}

                {successMessage ? (
                  <Text style={styles.success}>{successMessage}</Text>
                ) : null}

                <View style={styles.loginLinksContainer}>
                  <Text style={styles.whiteText}>Already have an account?</Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        if (Platform.OS === "web") {
                          (e.currentTarget as unknown as HTMLElement).blur();
                        }
                        router.push("/login");
                      }}
                    >                        
                    <Text style={styles.loginLink}>
                      Back to <Text style={[styles.loginLink, styles.boldLink]}>Login</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    cursor: 'auto',
  },
  scrollContainer: {
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
  error: {
    color: "#ff4d4f",
    marginTop: 12,
    textAlign: 'center',
    fontSize: 24,
  },
  success: {
    color: "#4ade80",
    marginTop: 12,
    textAlign: "center",
    fontSize: 24,
    // fontWeight: "600",
  },  
  loginLinksContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  whiteText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 24,
  },
  boldLink: {
    fontWeight: 'bold',
  },
  loginLinkText: {
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  signUpButton: {
    backgroundColor: "#ffd21f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  signUpButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default Signup;

