// // home/newEventModal/nativeDate.tsx
// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Platform,
//   Pressable,
//   StyleSheet,
// } from "react-native";
// import DateTimePicker, {
//   DateTimePickerEvent,
// } from "@react-native-community/datetimepicker";
// import { styles } from "../../../styles/homeStyles";

// type Props = {
//   startDay: Date | null;
//   setStartDay: (d: Date | null) => void;
//   iosTempDate: Date;
//   setIosTempDate: (d: Date) => void;
//   showDatePicker: boolean;
//   setShowDatePicker: (v: boolean) => void;
// };

// export default function NativeDate({
//   startDay,
//   setStartDay,
//   iosTempDate,
//   setIosTempDate,
//   showDatePicker,
//   setShowDatePicker,
// }: Props) {
//   if (Platform.OS === "web") return null;

//   const label = startDay
//     ? startDay.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       })
//     : "Select Date";
//   const labelColor = startDay ? "#ffffff" : "#a0a0a0";

//   const commit = (picked: Date) => {
//     // normalize to midnight to match your existing behavior
//     const d = new Date(
//       picked.getFullYear(),
//       picked.getMonth(),
//       picked.getDate(),
//       0,
//       0,
//       0
//     );
//     setIosTempDate(d);
//     setStartDay(d);
//     // NOTE: do NOT close on iOS; user taps outside (scrim) to close
//   };

//   const onChange = (event: DateTimePickerEvent, date?: Date) => {
//     if (Platform.OS === "android") {
//       // Android dialog closes itself; mirror that in state
//       if (event.type === "set" && date) commit(date);
//       setShowDatePicker(false);
//       return;
//     }
//     // iOS inline: keep open; allow multiple selections
//     if (date) commit(date);
//   };

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.input, styles.center]}
//         onPress={() => {
//           setIosTempDate(startDay ?? new Date());
//           setShowDatePicker(true);
//         }}
//         activeOpacity={0.8}
//       >
//         <Text style={[styles.inputText, { color: labelColor }]}>{label}</Text>
//       </TouchableOpacity>

//       {showDatePicker && (
//         // Full-coverage overlay INSIDE your existing modal
//         <View
//           style={[
//             StyleSheet.absoluteFill,
//             { zIndex: 1000, elevation: 1000, pointerEvents: "box-none" },
//           ]}
//         >

//           {/* Black scrim that blocks other inputs; tap to close */}
//           <Pressable
//             style={[
//               StyleSheet.absoluteFillObject,
//               { backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 12 },
//             ]}
//             onPress={() => {
//               // If nothing selected yet, default to today
//               if (!startDay) {
//                 const today = new Date();
//                 const d = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
//                 setIosTempDate(d);
//                 setStartDay(d);
//               }
//               setShowDatePicker(false);
//             }}            
//           />

//           {/* Calendar container: fills your modal width with matching padding */}
//           <View
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               paddingHorizontal: 12, // ← match your modal’s inner padding
//               paddingVertical: 12,   // ← match your modal’s inner padding
//               justifyContent: "center", // center in modal; change to "flex-start" if you prefer top
//               alignItems: "stretch",
//               pointerEvents: "box-none",
//             }}
//           >
//             {/* Reuse your existing sheet styling; stretch to modal width */}
//             <View
//               style={[
//                 styles.iosSheet,
//                 {
//                   width: "100%",
//                   marginBottom: 40, // remove stacked spacing while overlay is open
//                   pointerEvents: "auto",
//                 },
//               ]}
//             >
//               <DateTimePicker
//                 value={iosTempDate}
//                 mode="date"
//                 display={Platform.OS === "ios" ? "inline" : "spinner"}
//                 {...(Platform.OS === "ios" ? { locale: "en-US" } : {})}
//                 onChange={onChange}
//                 style={[styles.iosPicker, { alignSelf: "stretch" }]}
//               />
//             </View>
//           </View>
//         </View>
//       )}
//     </>
//   );
// }

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

  const labelColor = startDay ? "#ffffff" : "#a0a0a0";

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
                  dayTextColor: "#ffffff",
                  textDisabledColor: "#555",
                  arrowColor: "#ffd21f",
                  monthTextColor: "#ffffff",
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
