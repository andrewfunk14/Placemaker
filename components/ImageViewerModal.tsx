// components/ImageViewerModal.tsx
import React from "react";
import { Modal, TouchableOpacity, StyleSheet, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

function clamp(v: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(v, min), max);
}

interface ImageViewerModalProps {
  uri: string | null;
  onClose: () => void;
}

export default function ImageViewerModal({ uri, onClose }: ImageViewerModalProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  const reset = () => {
    scale.value = withTiming(1, { duration: 200 });
    translateX.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
    savedScale.value = 1;
    savedTX.value = 0;
    savedTY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 1, 8);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        scale.value = withTiming(1, { duration: 200 });
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        savedScale.value = 1;
        savedTX.value = 0;
        savedTY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onBegin(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      const maxTX = (SCREEN_W * (scale.value - 1)) / 2;
      const maxTY = (SCREEN_H * (scale.value - 1)) / 2;
      translateX.value = clamp(savedTX.value + e.translationX, -maxTX, maxTX);
      translateY.value = clamp(savedTY.value + e.translationY, -maxTY, maxTY);
    })
    .onEnd(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.5) {
        scale.value = withTiming(1, { duration: 200 });
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        savedScale.value = 1;
        savedTX.value = 0;
        savedTY.value = 0;
      } else {
        scale.value = withTiming(2.5, { duration: 200 });
        savedScale.value = 2.5;
      }
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Race(doubleTap, pan),
    pinch,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      onShow={() => reset()}
    >
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaView style={styles.container}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={onClose}
          />
          {uri && (
            <GestureDetector gesture={gesture}>
              <Animated.Image
                source={{ uri }}
                style={[styles.image, animatedStyle]}
                resizeMode="contain"
              />
            </GestureDetector>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#ff4d4f" />
          </TouchableOpacity>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.85,
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
