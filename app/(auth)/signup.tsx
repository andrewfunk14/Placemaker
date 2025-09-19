// signup.tsx
import React, { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, Link } from "expo-router";
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
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["placemaker"]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUserId, setRoles } = useUser();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleSignup = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;
      if (user) {
        await setUserId(user.id);

        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.id,
            name: name as string,
            email: email as string,
            role: ["placemaker"],
          },
        ]);

        if (insertError) throw insertError;

        await setRoles(selectedRoles);

        router.push('/(placemaker)/home');
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to sign up");
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
                returnKeyType="done"
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

                <View style={styles.loginLinksContainer}>
                  <Text style={styles.whiteText}>Already have an account?</Text>
                    <Link href="/login" asChild>
                      <TouchableOpacity>
                        <Text style={styles.loginLink}>
                          Back to <Text style={[styles.loginLink, styles.boldLink]}>Login</Text>
                        </Text>
                      </TouchableOpacity>
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
    backgroundColor: 'transparent',
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
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 24,
  },
  loginLinksContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  whiteText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
  loginLink: {
    marginTop: 12,
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

