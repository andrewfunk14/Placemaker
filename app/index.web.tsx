// index.web.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabaseClient";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const isMobile = windowWidth < 768;

export default function LandingPage() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToSection = (id: string) => {
    if (Platform.OS === "web") {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      const offsets: Record<string, number> = {
        whatWeDoSection: windowHeight,
        whoWeServeSection: windowHeight * 2,
      };
      scrollViewRef.current?.scrollTo({
        y: offsets[id] || 0,
        animated: true,
      });
    }
  };

  const handleWaitingListSignup = async () => {
    setIsLoading(true);
  
    try {
      if (!name || !email) {
        setMessage("Missing name or email");
        setMessageType("error");
  
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 5000);
  
        return;
      }
  
      const { error } = await supabase
        .from("waiting_list")
        .insert([{ name, email }]);
  
      if (error) {
        if (error.code === "23505") {
          setMessage("Email already on list");
          setMessageType("error");
        } else {
          setMessage("Something went wrong. Please try again");
          setMessageType("error");
        }
  
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 5000);
  
        return;
      }
  
      setMessage(`Thanks for joining, ${name}!`);
      setMessageType("success");
      setName("");
      setEmail("");
      // setTimeout(() => {
      //   setMessage("");
      //   setMessageType("");
      // }, 5000);
    } catch (err) {
      setMessage("Unexpected error. Please try again.");
      setMessageType("error");
  
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#222222", "#0d0d0d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerContent, isMobile && styles.headerContentMobile]}>
          <TouchableOpacity onPress={() => scrollToSection("heroSection")}>
            <Image
              source={require("../assets/dark-wordmark.svg")}
              style={styles.wordmark}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {isMobile ? (
            <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navLinks}>
              {/* <TouchableOpacity onPress={() => scrollToSection("whatWeDoSection")}>
                <Text style={styles.navText}>What We Do</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToSection("whoWeServeSection")}>
                <Text style={styles.navText}>Who We Serve</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === "web") {
                    window.open("/signup", "_blank");
                  } else {
                    router.push("/(auth)/signup");
                  }
                }}
              >
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === "web") {
                    window.open("/login", "_blank");
                  } else {
                    router.push("/(auth)/login");
                  }
                }}
              >
                <Text style={styles.loginButton}>Login</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginButton}>Login</Text>
              </TouchableOpacity> */}
            </View>
          )}
        </View>

        {isMobile && menuOpen && (
          <View style={styles.mobileMenu}>
            {/* <TouchableOpacity
              onPress={() => {
                scrollToSection("whatWeDoSection");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.mobileMenuItem}>What We Do</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                scrollToSection("whoWeServeSection");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.mobileMenuItem}>Who We Serve</Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity
              onPress={() => {
                router.push("/(auth)/login");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.mobileMenuItem}>Log In</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => {
                router.push("/(auth)/signup");
                setMenuOpen(false);
              }}
            >
              <Text style={styles.mobileMenuSignup}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Page Content */}
      <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
      {/* Hero Section */}
      <View nativeID="heroSection" style={[styles.section, styles.hero]}>
        <Text style={styles.heroTitle}>
            The Professional Community{"\n"}for Real Estate Development
          </Text>

          <Text style={styles.heroSubtitle}>
            Join our waiting list to gain early access to Placemaker.
          </Text>

          {/* Email signup box */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {message ? (
                <Text style={[styles.message, messageType === "error" ? styles.errorText : styles.successText]}>
                  {message}
                </Text>
              ) : null}

            <TouchableOpacity
              style={[styles.ctaButton, isLoading && { opacity: 0.7 }]}
                onPress={handleWaitingListSignup}
                disabled={isLoading}
            >
              <Text style={styles.ctaButtonText}>
                {isLoading ? "Joining..." : "Join Waiting List"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* <View id="whatWeDoSection" style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          <View style={styles.cardGrid}>
            <View style={styles.card}>
              <Ionicons name="trending-up-outline" size={32} color="#DC3545" style={styles.icon} />
              <Text style={styles.cardTitle}>Feature One</Text>
              <Text style={styles.cardText}>
                Placeholder text about what Placemaker does. Replace with real feature description.
              </Text>
            </View>
            <View style={styles.card}>
              <Ionicons name="construct-outline" size={32} color="#06B6D4" style={styles.icon} />
              <Text style={styles.cardTitle}>Feature Two</Text>
              <Text style={styles.cardText}>
                Another placeholder description for what we do. This could highlight collaboration or
                learning.
              </Text>
            </View>
            <View style={styles.card}>
              <Ionicons
                name="shield-checkmark-outline"
                size={32}
                color="#F97316"
                style={styles.icon}
              />
              <Text style={styles.cardTitle}>Feature Three</Text>
              <Text style={styles.cardText}>
                More placeholder text about tools, services, or opportunities that Placemaker offers.
              </Text>
            </View>
          </View>
        </View> */}

        {/* <View id="whoWeServeSection" style={styles.section}>
          <Text style={styles.sectionTitle}>Who We Serve</Text>
          <View style={styles.cardGrid}>
            <View style={styles.card}>
              <Ionicons name="bulb-outline" size={32} color="#DC3545" style={styles.icon} />
              <Text style={styles.cardTitle}>Entrepreneurs</Text>
              <Text style={styles.cardText}>
                Placeholder text about how Placemaker supports founders and startups.
              </Text>
            </View>
            <View style={styles.card}>
              <Ionicons name="cash-outline" size={32} color="#06B6D4" style={styles.icon} />
              <Text style={styles.cardTitle}>Investors</Text>
              <Text style={styles.cardText}>
                Placeholder text describing benefits for investors seeking new opportunities.
              </Text>
            </View>
            <View style={styles.card}>
              <Ionicons name="people-outline" size={32} color="#F97316" style={styles.icon} />
              <Text style={styles.cardTitle}>Community Builders</Text>
              <Text style={styles.cardText}>
                Placeholder text explaining how we help connectors and ecosystem builders.
              </Text>
            </View>
          </View>
        </View> */}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Placemaker. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0a0a0a",
    cursor: 'auto',
  },
  header: {
    position: "absolute",
    top: windowWidth > 1024 ? 20 : 8,
    left: 8,
    right: 8,
    alignItems: windowWidth > 1024 ? "center" : undefined,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0d0d0d",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "70%",
    minWidth: windowWidth > 1024 ? 650 : "90%",
    maxWidth: 1200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(0,0,0,0.25)" }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }),
  },
  headerContentMobile: {
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  wordmark: { 
    width: 160, 
    height: 40 
  },
  navLinks: { 
    flexDirection: "row", 
    gap: 20, 
    alignItems: "center" 
  },
  navText: { 
    color: "#fff", 
    fontSize: 18 
  },
  signupText: { 
    color: "#ffd21f", 
    fontSize: 18 
  },
  loginButton: {
    color: "#000",
    backgroundColor: "#ffd21f",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontWeight: "600",
    fontSize: 18,
  },
  menuIcon: { 
    fontSize: 28, 
    color: "#fff" 
  },
  mobileMenu: {
    backgroundColor: "#0d0d0d",
    // paddingVertical: 4,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  mobileMenuItem: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  mobileMenuSignup: {
    // backgroundColor: "#ffd21f",
    color: "#ffd21f",
    fontWeight: "600",
    fontSize: 18,
    // textAlign: "center",
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 4,
  },
  hero: {
    minHeight: windowHeight,
    justifyContent: "center",
    alignItems: "center",
    padding: isMobile ? 20 : 100,
  },
  heroTitle: {
    fontSize: isMobile ? 28 : 60,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  heroSubtitle: {
    fontSize: isMobile ? 16 : 24,
    color: "#ccc",
    textAlign: "center",
    marginBottom: windowWidth > 1024 ? 32 : 28,
  },
  formContainer: {
    borderRadius: 10,            
    width: "90%",                 
    maxWidth: 400,                
    alignSelf: "center",   
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: "#ffd21f",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: "center",
  },
  ctaButtonText: { 
    color: "#000", 
    fontWeight: "600", 
    fontSize: 18, 
  },
  message: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  errorText: {
    color: "#ff4d4f",
  },
  successText: {
    color: "#4ade80",
  },
  section: { 
    paddingVertical: windowWidth > 768 ? 116 : 100, 
    paddingHorizontal: 20, 
    alignItems: "center" 
  },
  sectionTitle: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 32 
  },
  cardGrid: {
    flexDirection: windowWidth > 768 ? "row" : "column",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap",
    maxWidth: 1000,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: windowWidth > 768 ? 280 : "100%",
    maxWidth: 320,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(0,0,0,0.25)" }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }),
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 10 
  },
  cardText: { 
    fontSize: 16, 
    color: "#aaa", 
    lineHeight: 22 
  },
  footer: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: "#222", 
    alignItems: "center" 
  },
  footerText: { 
    color: "#666", 
    fontSize: 14 
  },
  icon: { 
    marginBottom: 12 
  },
});
