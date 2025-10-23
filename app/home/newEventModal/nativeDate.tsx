// home/newEventModal/nativeDate.tsx
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../../../store/styles/homeStyles";

type Props = {
  startDay: Date | null;
  setStartDay: (d: Date | null) => void;
  iosTempDate: Date;
  setIosTempDate: (d: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
};

export default function NativeDate({
  startDay,
  setStartDay,
  iosTempDate,
  setIosTempDate,
  showDatePicker,
  setShowDatePicker,
}: Props) {
  if (Platform.OS === "web") return null;

  const label = startDay
    ? startDay.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Select Date";

  return (
    <>
      <TouchableOpacity
        style={[styles.input, styles.center]}
        onPress={() => {
          setIosTempDate(startDay ?? new Date());
          setShowDatePicker(true);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.inputText}>{label}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View style={styles.iosSheet}>
          <View style={styles.iosSheetBar}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.sheetBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const d = iosTempDate;
                setStartDay(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
                setShowDatePicker(false);
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
            value={iosTempDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "spinner"}
            {...(Platform.OS === "ios" ? { locale: "en-US" } : {})}
            onChange={(_, date) => {
              if (date) setIosTempDate(date);
            }}
            style={styles.iosPicker}
          />
        </View>
      )}
    </>
  );
}
