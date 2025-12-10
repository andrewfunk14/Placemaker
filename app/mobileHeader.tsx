// mobileHeader.tsx
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { popPath } from "../store/slices/navigationSlice";
import { resetHistory } from "../store/slices/navigationSlice";
import { cardShadow } from "../styles/shadow";
import { supabase } from "../lib/supabaseClient";
import { signOut } from "../store/slices/authSlice";
import { clearProfile } from "../store/slices/profileSlice";

interface MobileHeaderProps {
  showBackButton?: boolean;
  profileImageUrl?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  profileImageUrl,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const history = useAppSelector((state) => state.navigation.history);
  const [showMenu, setShowMenu] = useState(false);

  const handleBack = () => {
    const prev = history[history.length - 2];
  
    if (prev?.includes("/(chat)/")) {
      router.replace("/(placemaker)/(tabs)/(connect)/connect");
      return;
    }
  
    if (history.length > 1) {
      if (prev === "/login" || prev === "/(auth)/login") {
        router.replace("/(placemaker)/home");
      } else {
        dispatch(popPath());
        router.replace(prev);
      }
    } else {
      router.replace("/(placemaker)/home");
    }
  };  

  const closeMenu = () => setShowMenu(false);

  const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
        dispatch(signOut());
        dispatch(clearProfile());
        dispatch(resetHistory());
        router.replace("/login");
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <Image
            source={require("../assets/dark-wordmark.png")}
            style={styles.wordmark}
            resizeMode="cover"
          />
        </View>

        <View style={styles.rightContainer}>
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            style={styles.profileButton}
          >
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={50} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showMenu && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              onPress={() => {
                handleLogout
                closeMenu();
                dispatch(resetHistory());
                router.replace("/login");
              }}
              style={styles.menuItem}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: "relative",
    zIndex: 100,
  },
  headerContainer: {
    width: "100%",
    backgroundColor: "#0d0d0d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : 20,
    paddingBottom: 8,
  },
  leftContainer: {
    width: 50,
    alignItems: "flex-start",
  },
  backButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
  },
  wordmark: {
    width: 200,
    height: 52,
  },
  rightContainer: {
    width: 50,
    alignItems: "flex-end",
  },
  profileButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  overlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
    right: 12,
    backgroundColor: "transparent",
    zIndex: 9999,
  },
  menuContainer: {
    backgroundColor: "#0d0d0d",
    borderRadius: 8,
    padding: 8,
    width: 160,
    elevation: 5,
    ...cardShadow,
  },
  menuItem: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 20,
    color: "#000",
    // fontWeight: "bold",
  },
  logoutText: {
    fontSize: 20,
    color: "#ff4d4f",
    fontWeight: "600",
  },
});

export default MobileHeader;
