// components/ImageCropModal.tsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as IM from "expo-image-manipulator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const SCREEN_H = Dimensions.get("screen").height; // full screen incl. status bar
const TOP_BAR_H = 52;
const RATIO_BAR_H = 56; // content height only; safe area handled separately
const ZOOM_LABEL_H = 28;

const RATIOS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
];

function clamp(v: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(v, min), max);
}

function CornerGuides() {
  const SIZE = 22;
  const THICKNESS = 3;
  const COLOR = "rgba(255,255,255,0.9)";
  const arm = (pos: object, horiz: boolean) => ({
    position: "absolute" as const,
    backgroundColor: COLOR,
    width: horiz ? SIZE : THICKNESS,
    height: horiz ? THICKNESS : SIZE,
    ...pos,
  });
  return (
    <>
      <View style={arm({ top: 0, left: 0 }, true)} />
      <View style={arm({ top: 0, left: 0 }, false)} />
      <View style={arm({ top: 0, right: 0 }, true)} />
      <View style={arm({ top: 0, right: 0 }, false)} />
      <View style={arm({ bottom: 0, left: 0 }, true)} />
      <View style={arm({ bottom: 0, left: 0 }, false)} />
      <View style={arm({ bottom: 0, right: 0 }, true)} />
      <View style={arm({ bottom: 0, right: 0 }, false)} />
    </>
  );
}

export default function ImageCropModal({
  imageUri,
  imageWidth,
  imageHeight,
  visible,
  onCrop,
  onCancel,
}: {
  imageUri: string;
  imageWidth?: number;
  imageHeight?: number;
  visible: boolean;
  onCrop: (uri: string) => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();

  const [naturalW, setNaturalW] = useState(imageWidth ?? 1);
  const [naturalH, setNaturalH] = useState(imageHeight ?? 1);
  const [ready, setReady] = useState(!!(imageWidth && imageHeight));
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [zoomLabel, setZoomLabel] = useState("1.0×");

  // Safe, plain JS wrapper so runOnJS can call it from the UI thread worklet
  const setZoomLabelJS = useCallback((label: string) => {
    setZoomLabel(label);
  }, []);

  const availableH =
    SCREEN_H - TOP_BAR_H - RATIO_BAR_H - ZOOM_LABEL_H - insets.top - insets.bottom - 16;

  useEffect(() => {
    if (!imageUri || !visible) return;
    setSelectedRatio(null);
    setZoomLabel("1.0×");

    if (imageWidth && imageHeight) {
      setNaturalW(imageWidth);
      setNaturalH(imageHeight);
      setReady(true);
      return;
    }

    setReady(false);
    Image.getSize(
      imageUri,
      (w, h) => {
        setNaturalW(w > 0 ? w : SCREEN_W * 2);
        setNaturalH(h > 0 ? h : SCREEN_H * 2);
        setReady(true);
      },
      () => {
        setNaturalW(SCREEN_W * 2);
        setNaturalH(SCREEN_H * 2);
        setReady(true);
      }
    );
  }, [imageUri, visible, imageWidth, imageHeight]);

  // Keep display texture at screen resolution — avoids Android texture-size blurs
  const { displayW, displayH, naturalToDisplay } = useMemo(() => {
    const maxDim = Math.max(SCREEN_W, SCREEN_H);
    const r = Math.min(1, maxDim / Math.max(naturalW, naturalH, 1));
    return {
      displayW: Math.round(naturalW * r),
      displayH: Math.round(naturalH * r),
      naturalToDisplay: r,
    };
  }, [naturalW, naturalH]);

  const { cropW, cropH } = useMemo(() => {
    const ratio = selectedRatio ?? naturalW / Math.max(naturalH, 1);
    let w = SCREEN_W;
    let h = w / ratio;
    if (h > availableH) {
      h = availableH;
      w = h * ratio;
    }
    return { cropW: w, cropH: h };
  }, [selectedRatio, naturalW, naturalH, availableH]);

  const minScale = useMemo(
    () => Math.max(cropW / Math.max(displayW, 1), cropH / Math.max(displayH, 1)),
    [cropW, cropH, displayW, displayH]
  );

  // ── Shared values ──────────────────────────────────────────────────────────
  const scale = useSharedValue(minScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(minScale);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  const minScaleSV = useSharedValue(minScale);
  const displayWSV = useSharedValue(displayW);
  const displayHSV = useSharedValue(displayH);
  const cropWSV = useSharedValue(cropW);
  const cropHSV = useSharedValue(cropH);

  useEffect(() => {
    minScaleSV.value = minScale;
    displayWSV.value = displayW;
    displayHSV.value = displayH;
    cropWSV.value = cropW;
    cropHSV.value = cropH;
  }, [minScale, displayW, displayH, cropW, cropH]);

  useEffect(() => {
    const dur = { duration: 220 };
    scale.value = withTiming(minScale, dur);
    translateX.value = withTiming(0, dur);
    translateY.value = withTiming(0, dur);
    savedScale.value = minScale;
    savedTX.value = 0;
    savedTY.value = 0;
    setZoomLabel("1.0×");
  }, [minScale]);

  // ── Gestures ───────────────────────────────────────────────────────────────
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      "worklet";
      savedScale.value = scale.value;
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      "worklet";
      const s = clamp(savedScale.value * e.scale, minScaleSV.value, minScaleSV.value * 10);
      scale.value = s;
      const maxTX = (displayWSV.value * s - cropWSV.value) / 2;
      const maxTY = (displayHSV.value * s - cropHSV.value) / 2;
      translateX.value = clamp(translateX.value, -maxTX, maxTX);
      translateY.value = clamp(translateY.value, -maxTY, maxTY);
      runOnJS(setZoomLabelJS)((s / minScaleSV.value).toFixed(1) + "×");
    })
    .onEnd(() => {
      "worklet";
      savedScale.value = scale.value;
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      "worklet";
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      "worklet";
      const maxTX = (displayWSV.value * scale.value - cropWSV.value) / 2;
      const maxTY = (displayHSV.value * scale.value - cropHSV.value) / 2;
      translateX.value = clamp(savedTX.value + e.translationX, -maxTX, maxTX);
      translateY.value = clamp(savedTY.value + e.translationY, -maxTY, maxTY);
    })
    .onEnd(() => {
      "worklet";
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd(() => {
      "worklet";
      const target =
        scale.value > minScaleSV.value * 1.5 ? minScaleSV.value : minScaleSV.value * 2.5;
      scale.value = withTiming(target, { duration: 220 });
      translateX.value = withTiming(0, { duration: 220 });
      translateY.value = withTiming(0, { duration: 220 });
      savedScale.value = target;
      savedTX.value = 0;
      savedTY.value = 0;
      runOnJS(setZoomLabelJS)((target / minScaleSV.value).toFixed(1) + "×");
    });

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // ── Crop ───────────────────────────────────────────────────────────────────
  const handleCrop = useCallback(async () => {
    setProcessing(true);
    try {
      const s = scale.value;
      const tx = translateX.value;
      const ty = translateY.value;

      const originX_d = displayW / 2 - cropW / (2 * s) - tx / s;
      const originY_d = displayH / 2 - cropH / (2 * s) - ty / s;

      const originX = Math.max(0, Math.round(originX_d / naturalToDisplay));
      const originY = Math.max(0, Math.round(originY_d / naturalToDisplay));
      const cropWidth = Math.min(
        Math.round((cropW / s) / naturalToDisplay),
        naturalW - originX
      );
      const cropHeight = Math.min(
        Math.round((cropH / s) / naturalToDisplay),
        naturalH - originY
      );

      const isUnmodified =
        selectedRatio === null &&
        Math.abs(s - minScale) < 0.01 &&
        Math.abs(tx) < 1 &&
        Math.abs(ty) < 1;

      if (isUnmodified) {
        onCrop(imageUri);
        return;
      }

      const context = IM.ImageManipulator.manipulate(imageUri);
      context.crop({
        originX,
        originY,
        width: Math.max(1, cropWidth),
        height: Math.max(1, cropHeight),
      });
      const imageRef = await context.renderAsync();
      const result = await imageRef.saveAsync({
        compress: 0.92,
        format: IM.SaveFormat.JPEG,
      });
      onCrop(result.uri);
    } catch (err) {
      console.error("[ImageCropModal] crop error:", err);
      onCrop(imageUri);
    } finally {
      setProcessing(false);
    }
  }, [imageUri, naturalW, naturalH, displayW, displayH, naturalToDisplay, cropW, cropH, minScale, selectedRatio]);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onCancel}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.titleText}>Adjust Photo</Text>
            <TouchableOpacity
              onPress={handleCrop}
              disabled={processing || !ready}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              {processing ? (
                <ActivityIndicator color="#ffd21f" size="small" />
              ) : (
                <Text style={[styles.useText, !ready && { opacity: 0.4 }]}>Use</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Crop viewport */}
          <View style={styles.cropArea}>
            {!ready ? (
              <ActivityIndicator color="#ffd21f" size="large" />
            ) : (
              <GestureDetector gesture={gesture}>
                <View
                  style={{ width: cropW, height: cropH, overflow: "hidden" }}
                  collapsable={false}
                >
                  <Animated.Image
                    source={{ uri: imageUri }}
                    style={[
                      {
                        position: "absolute",
                        width: displayW,
                        height: displayH,
                        left: (cropW - displayW) / 2,
                        top: (cropH - displayH) / 2,
                      },
                      animatedStyle,
                    ]}
                    resizeMode="cover"
                    resizeMethod={Platform.OS === "android" ? "resize" : "auto"}
                  />
                  <CornerGuides />
                  <View style={[styles.gridLine, { top: "33.33%", left: 0, right: 0, height: StyleSheet.hairlineWidth }]} />
                  <View style={[styles.gridLine, { top: "66.66%", left: 0, right: 0, height: StyleSheet.hairlineWidth }]} />
                  <View style={[styles.gridLine, { left: "33.33%", top: 0, bottom: 0, width: StyleSheet.hairlineWidth }]} />
                  <View style={[styles.gridLine, { left: "66.66%", top: 0, bottom: 0, width: StyleSheet.hairlineWidth }]} />
                </View>
              </GestureDetector>
            )}
          </View>

          {/* Zoom level */}
          <View style={styles.zoomLabelRow}>
            <Text style={styles.zoomLabelText}>{zoomLabel}</Text>
          </View>

          {/* Aspect ratio selector — bottom padding accounts for nav bar */}
          <View style={[styles.ratioBar, { paddingBottom: insets.bottom + 8 }]}>
            {RATIOS.map((r) => {
              const active = r.value === selectedRatio;
              return (
                <TouchableOpacity
                  key={r.label}
                  onPress={() => setSelectedRatio(r.value)}
                  style={[styles.ratioBtn, active && styles.ratioBtnActive]}
                >
                  <Text style={[styles.ratioText, active && styles.ratioTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  topBar: {
    height: TOP_BAR_H,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 16,
    color: "#aaa",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  useText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffd21f",
  },
  cropArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  zoomLabelRow: {
    height: ZOOM_LABEL_H,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d0d0d",
  },
  zoomLabelText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  ratioBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#222",
    minHeight: RATIO_BAR_H,
  },
  ratioBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
  },
  ratioBtnActive: {
    borderColor: "#ffd21f",
    backgroundColor: "rgba(255, 210, 31, 0.08)",
  },
  ratioText: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "600",
  },
  ratioTextActive: {
    color: "#ffd21f",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
