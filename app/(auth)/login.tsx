// login.tsx
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
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

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      emailRef.current?.focus();
    }
  }, []);

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
          .select("roles, email")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData?.roles) {
          await setRoles(profileData.roles);
        }

        router.push('/(placemaker)/home');
    }
    } catch (error: any) {
      setErrorMessage("Email or password is incorrect");
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

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={(e) => {
                  if (Platform.OS === "web") {
                    (e.currentTarget as unknown as HTMLElement).blur();
                  }
                  router.push("/forgotpassword");
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
              ) : null}

              <View style={styles.signupLinksContainer}>
                <Text style={styles.whiteText}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      if (Platform.OS === "web") {
                        (e.currentTarget as unknown as HTMLElement).blur();
                      }
                      router.push("/signup");
                    }}
                  >                  
                  <Text style={styles.signupLinkText}>Sign Up</Text>
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
    backgroundColor: "transparent",
    cursor: 'auto',
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
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
  },
  forgotPasswordButton: {
    alignSelf: "center",
    // paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "transparent",
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
    color: "#ff4d4f",
    marginTop: 12,
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
    marginBottom: 12,
  },
  signupLinkText: {
    textAlign: 'center',
    color: '#2e78b7',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
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
