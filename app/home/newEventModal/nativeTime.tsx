// home/newEventModal/nativeTime.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { styles } from "../../../styles/homeStyles";

type Props = {
  startTime: { h: number; m: number } | null;
  setStartTime: (t: { h: number; m: number } | null) => void;
  iosTempTime: Date;
  setIosTempTime: (d: Date) => void;
  showTimePicker: boolean;
  setShowTimePicker: (v: boolean) => void;
};

export default function NativeTime({
  startTime,
  setStartTime,
  iosTempTime,
  setIosTempTime,
  showTimePicker,
  setShowTimePicker,
}: Props) {
  if (Platform.OS === "web") return null;

  const label = startTime
    ? new Date(2000, 0, 1, startTime.h, startTime.m).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Select Time";
  const labelColor = startTime ? "#ffffff" : "#a0a0a0";

  const commit = (picked: Date) => {
    setIosTempTime(picked);
    setStartTime({ h: picked.getHours(), m: picked.getMinutes() });
    // iOS: DO NOT close here — user taps the scrim to close
  };

  const onChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      // Android dialog: 'set' or 'dismissed'
      if (event.type === "set" && date) commit(date);
      setShowTimePicker(false);
      return;
    }
    // iOS spinner: allow multiple tweaks, keep open
    if (date) commit(date);
  };

  // const open = () => {
  //   // Seed temp time from current selection or a sensible default
  //   const seed = new Date(2000, 0, 1, startTime?.h ?? 12, startTime?.m ?? 0);
  //   setIosTempTime(seed);
  //   setShowTimePicker(true);
  // };

  const open = () => {
    // 🕒 Default to the *current local time* if no selection yet
    const now = new Date();
    const seed = new Date(
      2000,
      0,
      1,
      startTime?.h ?? now.getHours(),
      startTime?.m ?? now.getMinutes()
    );
    setIosTempTime(seed);
    setShowTimePicker(true);
  };  

  const closeViaScrim = () => {
    // If user opened and tapped out without a selection,
    // commit whatever is currently in iosTempTime so we don't leave it empty.
    if (!startTime) {
      setStartTime({ h: iosTempTime.getHours(), m: iosTempTime.getMinutes() });
    }
    setShowTimePicker(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.input, styles.center]}
        onPress={open}
        activeOpacity={0.8}
      >
        <Text style={[styles.inputText, { color: labelColor }]}>{label}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        // Full-coverage overlay INSIDE your existing modal
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000 }]}
          pointerEvents="box-none"
        >
          {/* Black scrim that blocks other inputs; tap to close */}
          <Pressable
            style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.8)" }]}
            onPress={closeViaScrim}
          />

          {/* Calendar container: fills your modal width with matching padding */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              paddingHorizontal: 12,
              paddingVertical: 12,
              justifyContent: "center",
              alignItems: "stretch",
            }}
            pointerEvents="box-none"
          >
            <View
              style={{
                borderRadius: 12,
                width: "100%",
              }}
              pointerEvents="auto"
            >
              <View style={[styles.iosSheet, { marginBottom: 0 }]}>
                <DateTimePicker
                  value={iosTempTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "spinner"}
                  {...(Platform.OS === "ios" ? { locale: "en-US" } : {})}
                  {...(Platform.OS === "android" ? { is24Hour: false } : {})}
                  onChange={onChange}
                  style={[styles.iosPicker, { alignSelf: "stretch" }]}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
}
