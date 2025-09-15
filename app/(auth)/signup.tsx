// signup.tsx
import React, { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, Link } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Keyboard,
} from "react-native";
import { Dimensions } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { useUser, UserRole } from "../userContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["placemaker"]); // default
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUserId, setRoles } = useUser(); // updated hook

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleSignup = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;
      if (user) {
        await setUserId(user.id);

        // 2. Insert into users table with role
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

        // 3. Redirect everyone to same home page
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
      <View style={styles.gradientBackground} />
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
                <Text style={styles.title}>Join Placemakers</Text>

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

                {/* <Text style={styles.label}>Choose your role</Text>
                <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={role}
                    onValueChange={(itemValue) => setRole(itemValue as UserRole)} // ✅ cast to UserRole
                >
                    <Picker.Item label="Placemaker" value="placemaker" />
                    <Picker.Item label="Policymaker" value="policymaker" />
                    <Picker.Item label="Dealmaker" value="dealmaker" />
                    <Picker.Item label="Changemaker" value="changemaker" />
                </Picker>
                </View> */}

                <TouchableOpacity
                style={[styles.signUpButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={isLoading}
                >
                <Text style={styles.buttonText}>
                    {isLoading ? "Signing up..." : "Sign Up"}
                </Text>
                </TouchableOpacity>

                {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
                ) : null}

                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.loginLink}>
                        Already have an account? <Text style={styles.boldLink}>Login</Text>
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
  scrollContainer: {
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
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 20,
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  loginLink: {
    marginTop: 12,
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 22,
  },
  signupLink: {
    marginTop: 10,
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 22,
  },
  boldLink: {
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    width: '80%',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
  },
});

export default Signup;

