// home/newEventModal/nativeTime.tsx
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../../../store/styles/homeStyles";

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

  return (
    <>
      <TouchableOpacity
        style={[styles.input, styles.center]}
        onPress={() => {
          const seed = new Date(2000, 0, 1, startTime?.h ?? 12, startTime?.m ?? 0);
          setIosTempTime(seed);
          setShowTimePicker(true);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.inputText}>{label}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <View style={styles.iosSheet}>
          <View style={styles.iosSheetBar}>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={styles.sheetBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStartTime({
                  h: iosTempTime.getHours(),
                  m: iosTempTime.getMinutes(),
                });
                setShowTimePicker(false);
              }}
            >
              <Text
                style={[styles.sheetBtnText, { color: "#ffd21f", fontWeight: "800" }]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={iosTempTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "spinner"}
            {...(Platform.OS === "ios" ? { locale: "en-US" } : {})}
            {...(Platform.OS === "android" ? { is24Hour: false } : {})}
            onChange={(_, date) => {
              if (date) setIosTempTime(date);
            }}
            style={styles.iosPicker}
          />
        </View>
      )}
    </>
  );
}
