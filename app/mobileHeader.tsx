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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { popPath } from "../store/slices/navigationSlice";
import { resetHistory } from "../store/slices/navigationSlice";

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
    if (history.length > 1) {
      dispatch(popPath());
      const prev = history[history.length - 2];
      router.replace(prev);
    } else {
      router.replace("/(placemaker)/home"); 
    }
  };

  const closeMenu = () => setShowMenu(false);


  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        {/* Back Button */}
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Center Wordmark */}
        <View style={styles.centerContainer}>
          <Image
            source={require("../assets/dark-wordmark.png")}
            style={styles.wordmark}
            resizeMode="cover"
          />
        </View>

        {/* Profile Picture */}
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
    paddingBottom: 12,
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
    height: 50,
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
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    width: 160,
    elevation: 5,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
  },
  menuItem: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
  },
  logoutText: {
    fontSize: 20,
    color: "red",
    fontWeight: "bold",
  },
});

export default MobileHeader;
