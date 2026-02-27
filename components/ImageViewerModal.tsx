// components/ImageViewerModal.tsx
import React from "react";
import {
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface ImageViewerModalProps {
  uri: string | null;
  onClose: () => void;
}

export default function ImageViewerModal({ uri, onClose }: ImageViewerModalProps) {
  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        {uri && (
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: "100%",
    height: "85%",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 9999,
    padding: 6,
  },
});
