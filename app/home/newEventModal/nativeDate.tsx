// home/newEventModal/nativeDate.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { styles } from "../../../styles/homeStyles";

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

  const labelColor = startDay ? "#f5f5f5" : "#a0a0a0";

  const commit = (picked: Date) => {
    const d = new Date(
      picked.getFullYear(),
      picked.getMonth(),
      picked.getDate(),
      0,
      0,
      0
    );
    setIosTempDate(d);
    setStartDay(d);
    setShowDatePicker(false);
  };

  const selectedKey = startDay
    ? startDay.toISOString().split("T")[0]
    : undefined;

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
        <Text style={[styles.inputText, { color: labelColor }]}>
          {label}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { zIndex: 1000, elevation: 1000, pointerEvents: "box-none" },
          ]}
        >
          {/* Scrim */}
          <Pressable
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0,0,0,0.85)", borderRadius: 12 },
            ]}
            onPress={() => {
              if (!startDay) {
                const today = new Date();
                commit(today);
              }
              setShowDatePicker(false);
            }}
          />

          {/* Centered calendar container */}
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
              pointerEvents: "box-none",
            }}
          >
            <View
              style={[
                styles.iosSheet,
                {
                  width: "100%",
                  marginBottom: 40,
                  padding: 8,
                  pointerEvents: "auto",
                },
              ]}
            >
              <Calendar
                current={iosTempDate.toISOString().split("T")[0]}
                onDayPress={(day) => {
                  const picked = new Date(
                    `${day.dateString}T00:00:00`
                  );
                  commit(picked);
                }}
                markedDates={
                  selectedKey
                    ? {
                        [selectedKey]: {
                          selected: true,
                          selectedColor: "#ffd21f",
                          selectedTextColor: "#000000",
                        },
                      }
                    : undefined
                }
                theme={{
                  backgroundColor: "#121212",
                  calendarBackground: "#121212",
                  textSectionTitleColor: "#9ca3af",
                  selectedDayBackgroundColor: "#ffd21f",
                  selectedDayTextColor: "#000000",
                  todayTextColor: "#ffd21f",
                  dayTextColor: "#f5f5f5",
                  textDisabledColor: "#555",
                  arrowColor: "#ffd21f",
                  monthTextColor: "#f5f5f5",
                  indicatorColor: "#ffd21f",
                  textMonthFontSize: 20,
                  textMonthFontWeight: "700",
                  textDayFontSize: 16,
                  textDayFontWeight: "500",
                }}
                style={{
                  borderRadius: 12,
                }}
              />
            </View>
          </View>
        </View>
      )}
    </>
  );
}
