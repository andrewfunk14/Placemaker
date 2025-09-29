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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

export default function LandingPage() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [email, setEmail] = useState("");

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

  const handleBetaSignup = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }
    Alert.alert("Success", `Thanks for joining our beta list, ${email}!`);
    setEmail("");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#222222', '#0d0d0d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/dark-wordmark.svg')}
            style={styles.wordmark}
            resizeMode="cover"
          />
          <View style={styles.navLinks}>
            <TouchableOpacity onPress={() => scrollToSection("whatWeDoSection")}>
              <Text style={styles.navText}>What We Do</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => scrollToSection("whoWeServeSection")}>
              <Text style={styles.navText}>Who We Serve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.navText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signupButton}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Page Content */}
      <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
        {/* Hero Section */}
        <View id="heroSection" style={[styles.section, styles.hero]}>
          <Text style={styles.heroTitle}>
          The #1 Private Community{"\n"}for Real Estate Development.
          </Text>

          <Text style={styles.heroSubtitle}>
            Join our waiting list to gain early access to the Placemaker community.
          </Text>

          {/* Email signup box */}
          <View style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.ctaButton} onPress={handleBetaSignup}>
              <Text style={styles.ctaButtonText}>Join List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* What We Do Section */}
        <View id="whatWeDoSection" style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          <View style={styles.cardGrid}>
            <View style={styles.card}>
              <Ionicons
                name="trending-up-outline"
                size={32}
                color="#DC3545"
                style={styles.icon}
              />
              <Text style={styles.cardTitle}>Feature One</Text>
              <Text style={styles.cardText}>
                Placeholder text about what Placemaker does. Replace with real
                feature description.
              </Text>
            </View>
            <View style={styles.card}>
              <Ionicons
                name="construct-outline"
                size={32}
                color="#06B6D4"
                style={styles.icon}
              />
              <Text style={styles.cardTitle}>Feature Two</Text>
              <Text style={styles.cardText}>
                Another placeholder description for what we do. This could
                highlight collaboration or learning.
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
                More placeholder text about tools, services, or opportunities
                that Placemaker offers.
              </Text>
            </View>
          </View>
        </View>

        {/* Who We Serve Section */}
        <View id="whoWeServeSection" style={styles.section}>
          <Text style={styles.sectionTitle}>Who We Serve</Text>
          <View style={styles.cardGrid}>
            <View style={styles.card}>
              <Ionicons
                name="bulb-outline"
                size={32}
                color="#DC3545"
                style={styles.icon}
              />
              <Text style={styles.cardTitle}>Entrepreneurs</Text>
              <Text style={styles.cardText}>
                Placeholder text about how Placemaker supports founders and
                startups.
              </Text>
            </View>
            <View style={styles.card}>
              <Ionicons
                name="cash-outline"
                size={32}
                color="#06B6D4"
                style={styles.icon}
              />
              <Text style={styles.cardTitle}>Investors</Text>
              <Text style={styles.cardText}>
                Placeholder text describing benefits for investors seeking new
                opportunities.
              </Text>
            </View>
            <View style={styles.card}>
              <Ionicons
                name="people-outline"
                size={32}
                color="#F97316"
                style={styles.icon}
              />
              <Text style={styles.cardTitle}>Community Builders</Text>
              <Text style={styles.cardText}>
                Placeholder text explaining how we help connectors and
                ecosystem builders.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Placemaker. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0a0a0a" 
  },
  header: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0d0d0d",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "70%",
    minWidth: 600,
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
  wordmark: {
    width: 160,
    height: 40,
    resizeMode: "contain",
  },
  navLinks: { 
    flexDirection: "row", 
    gap: 20, 
    alignItems: "center" 
  },
  navText: { 
    color: "#fff", 
    fontSize: 16 
  },
  signupButton: {
    color: "#000",
    backgroundColor: "#ffd21f",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontWeight: "600",
  },
  hero: {
    minHeight: windowHeight,
    justifyContent: "center",
    alignItems: "center",
    padding: 100,
    // paddingTop: 120,
  },
  heroTitle: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 24,
    color: "#ccc",
    textAlign: "center",
    // maxWidth: 600,
    marginBottom: 32,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    height: 50,
    maxWidth: 600,
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ctaButton: {
    backgroundColor: "#ffd21f",
    paddingHorizontal: 20,
    borderRadius: 6,
    justifyContent: "center",
  },
  ctaButtonText: { 
    color: "#000", 
    fontWeight: "600", 
    fontSize: 16 
  },
  section: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 32,
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
    alignItems: "center",
  },
  footerText: { 
    color: "#666", 
    fontSize: 14 
  },
  icon: { 
    marginBottom: 12 
  },
});
