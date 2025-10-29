// profile/webCropper.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text } from "react-native";
import type { CropPixels } from "../../utils/cropHelpers";
import type { Area } from "react-easy-crop";
import { profileStyles as styles } from "../../styles/profileStyles";

interface WebCropperProps {
  src: string;
  onCropComplete: (pixels: CropPixels) => void;
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
}

let EasyCrop: React.ComponentType<any> | null = null;
if (typeof window !== "undefined") {
  EasyCrop = require("react-easy-crop").default as React.ComponentType<any>;
}

export default function WebCropper({
  src,
  onCropComplete,
  initialCrop = { x: 0, y: 0 },
  initialZoom = 0.9,
}: WebCropperProps) {
  const [crop, setCrop] = useState(initialCrop);
  const [zoom, setZoom] = useState(initialZoom);
  const [dragging, setDragging] = useState(false);
  const [vw, setVw] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const containerSize = useMemo(() => Math.min(vw - 64, 400), [vw]);
  const circleSize = Math.round(containerSize);

  const handleCropComplete = useCallback(
    (_: Area, pixels: CropPixels) => onCropComplete(pixels),
    [onCropComplete]
  );

  if (!EasyCrop) return null;

  return (
    <View style={[styles.cropperContainer, { width: containerSize, height: containerSize }]}>
      <Text style={styles.cropperInstruction}>Scroll to zoom. Drag to adjust</Text>

      <View style={styles.cropperCircleWrap}>
        <EasyCrop
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          cropSize={{ width: circleSize, height: circleSize }}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          onInteractionStart={() => setDragging(true)}
          onInteractionEnd={() => setDragging(false)}
          cropperStyle={{
            touchAction: "none",
            cursor: dragging ? "grabbing" : "grab",
            background: "#000",
          }}
          imageCrossOrigin="anonymous"
          objectFit="cover"
          minZoom={0.6}
          maxZoom={8}
          restrictPosition={false}
          zoomSpeed={0.9}
        />
      </View>
    </View>
  );
}