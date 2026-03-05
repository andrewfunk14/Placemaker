// privacy.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cardShadow } from "../styles/shadow";

const { width: windowWidth } = Dimensions.get("window");
const isMobile = windowWidth < 768;

export default function PrivacyPolicy() {
  const router = useRouter();

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
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image
              source={require("../assets/dark-wordmark.png")}
              style={styles.wordmark}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.pageTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: March 4, 2026</Text>

          <Section title="1. Introduction">
            <Body>
              Placemaker ("we," "us," or "our") operates the Placemaker platform, a professional
              community for real estate developers. This Privacy Policy explains how we collect,
              use, disclose, and protect your information when you use our website, mobile
              application, and services (collectively, the "Platform").
            </Body>
            <Body>
              By creating an account or using the Platform, you agree to the collection and use
              of information as described in this policy.
            </Body>
          </Section>

          <Section title="2. Information We Collect">
            <SubHeading>2.1 Information You Provide</SubHeading>
            <BulletList items={[
              "Account registration details: name, email address, and password",
              "Profile information: professional background, expertise, asset types, markets, and needs",
              "Profile photo or avatar",
              "Messages and content you send or post within the Platform",
            ]} />

            <SubHeading>2.2 Information We Collect Automatically</SubHeading>
            <BulletList items={[
              "Device information: device type, operating system, and browser type",
              "Usage data: pages visited, features used, and interactions within the Platform",
              "IP address and approximate location data",
              "Cookies and similar tracking technologies",
            ]} />

            <SubHeading>2.3 Information from Third Parties</SubHeading>
            <Body>
              We may receive information about you from third-party services you connect to
              the Platform, such as authentication providers. We only collect information
              necessary for the functionality you choose to use.
            </Body>
          </Section>

          <Section title="3. How We Use Your Information">
            <Body>We use the information we collect to:</Body>
            <BulletList items={[
              "Create and manage your account",
              "Provide, operate, and improve the Platform",
              "Enable communication between members through groups and direct messages",
              "Facilitate professional connections and curated introductions",
              "Send service-related communications (e.g., account confirmations, security alerts)",
              "Send updates about new features, events, or community news (you may opt out at any time)",
              "Detect, investigate, and prevent fraudulent or unauthorized activity",
              "Comply with legal obligations",
            ]} />
          </Section>

          <Section title="4. How We Share Your Information">
            <Body>
              We do not sell your personal information. We may share your information in the
              following limited circumstances:
            </Body>
            <BulletList items={[
              "With other members: Your profile information, posts, and messages are visible to other Platform members as intended by the community features",
              "With service providers: We use trusted third-party providers (such as Supabase for database and authentication) who process data on our behalf under confidentiality obligations",
              "For legal compliance: When required by law, regulation, or valid legal process",
              "Business transfers: In connection with a merger, acquisition, or sale of assets, with appropriate confidentiality protections",
              "With your consent: For any other purpose with your explicit consent",
            ]} />
          </Section>

          <Section title="5. Data Storage and Security">
            <Body>
              Your data is stored using Supabase, a secure cloud database provider. We implement
              industry-standard security measures including:
            </Body>
            <BulletList items={[
              "Encrypted data transmission (TLS/SSL)",
              "Secure password hashing",
              "Row-level security policies restricting data access",
              "Regular security reviews",
            ]} />
            <Body>
              No method of transmission over the internet or electronic storage is 100% secure.
              While we strive to protect your data, we cannot guarantee absolute security.
            </Body>
          </Section>

          <Section title="6. Data Retention">
            <Body>
              We retain your personal information for as long as your account is active or as
              needed to provide services. If you delete your account, we will delete or anonymize
              your personal data within 90 days, except where we are required to retain it for
              legal or compliance purposes.
            </Body>
            <Body>
              Message content in group chats and direct messages may be retained as part of
              conversation history for other members who participated in those conversations.
            </Body>
          </Section>

          <Section title="7. Your Rights and Choices">
            <Body>You have the following rights regarding your personal information:</Body>
            <BulletList items={[
              "Access: Request a copy of the personal data we hold about you",
              "Correction: Update or correct inaccurate information in your profile settings",
              "Deletion: Request deletion of your account and associated personal data",
              "Portability: Request your data in a portable format",
              "Opt-out: Unsubscribe from marketing emails at any time using the unsubscribe link",
              "Restriction: Request that we limit how we process your data in certain circumstances",
            ]} />
          </Section>

          <Section title="8. Contact Us">
            <Body style={styles.contactInfo}>
              Email:{" "}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL("mailto:joinplacemaker@gmail.com")}
              >
                joinplacemaker@gmail.com
              </Text>
              {"\n"}
              Website:{" "}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL("https://joinplacemaker.com")}
              >
                joinplacemaker.com
              </Text>
            </Body>
          </Section>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Placemaker. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function SubHeading({ children }: { children: string }) {
  return <Text style={sectionStyles.subHeading}>{children}</Text>;
}

function Body({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[sectionStyles.body, style]}>{children}</Text>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={sectionStyles.bulletList}>
      {items.map((item, i) => (
        <View key={i} style={sectionStyles.bulletItem}>
          <Text style={sectionStyles.bullet}>•</Text>
          <Text style={sectionStyles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: isMobile ? 20 : 22,
    fontWeight: "700",
    color: "#f5f5f5",
    marginBottom: 12,
  },
  subHeading: {
    fontSize: isMobile ? 17 : 18,
    fontWeight: "600",
    color: "#ffd21f",
    marginTop: 12,
    marginBottom: 8,
  },
  body: {
    fontSize: isMobile ? 15 : 16,
    color: "#ccc",
    lineHeight: 26,
    marginBottom: 10,
  },
  bulletList: {
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingRight: 8,
  },
  bullet: {
    color: "#ffd21f",
    fontSize: 16,
    marginRight: 8,
    lineHeight: 26,
  },
  bulletText: {
    fontSize: isMobile ? 15 : 16,
    color: "#ccc",
    lineHeight: 26,
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    position: "absolute",
    top: windowWidth > 1024 ? 20 : 16,
    left: 12,
    right: 12,
    alignItems: windowWidth > 1024 ? "center" : undefined,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 12,
    borderColor: "#ffd21f",
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "70%",
    minWidth: windowWidth > 1024 ? 650 : "80%",
    maxWidth: 1200,
    ...cardShadow,
  },
  headerContentMobile: {
    width: "100%",
    paddingHorizontal: 16,
  },
  wordmark: {
    width: 160,
    height: 40,
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 40,
  },
  contentContainer: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: isMobile ? 20 : 40,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: isMobile ? 32 : 44,
    fontWeight: "bold",
    color: "#f5f5f5",
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    marginBottom: 40,
  },
  link: {
    color: "#2e78b7",
  },
  contactInfo: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffd21f",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#222",
    alignItems: "center",
    gap: 8,
    paddingTop: 28,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
});
