// // home/newEventModal/nativeTime.tsx
// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Platform,
//   Pressable,
//   StyleSheet,
// } from "react-native";
// import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
// import { styles } from "../../../styles/homeStyles";

// type Props = {
//   startTime: { h: number; m: number } | null;
//   setStartTime: (t: { h: number; m: number } | null) => void;
//   iosTempTime: Date;
//   setIosTempTime: (d: Date) => void;
//   showTimePicker: boolean;
//   setShowTimePicker: (v: boolean) => void;
// };

// export default function NativeTime({
//   startTime,
//   setStartTime,
//   iosTempTime,
//   setIosTempTime,
//   showTimePicker,
//   setShowTimePicker,
// }: Props) {
//   if (Platform.OS === "web") return null;

//   const label = startTime
//     ? new Date(2000, 0, 1, startTime.h, startTime.m).toLocaleTimeString("en-US", {
//         hour: "numeric",
//         minute: "2-digit",
//       })
//     : "Select Time";
//   const labelColor = startTime ? "#ffffff" : "#a0a0a0";

//   const commit = (picked: Date) => {
//     setIosTempTime(picked);
//     setStartTime({ h: picked.getHours(), m: picked.getMinutes() });
//     // iOS: DO NOT close here — user taps the scrim to close
//   };

//   const onChange = (event: DateTimePickerEvent, date?: Date) => {
//     if (Platform.OS === "android") {
//       // Android dialog: 'set' or 'dismissed'
//       if (event.type === "set" && date) commit(date);
//       setShowTimePicker(false);
//       return;
//     }
//     // iOS spinner: allow multiple tweaks, keep open
//     if (date) commit(date);
//   };

//   // const open = () => {
//   //   // Seed temp time from current selection or a sensible default
//   //   const seed = new Date(2000, 0, 1, startTime?.h ?? 12, startTime?.m ?? 0);
//   //   setIosTempTime(seed);
//   //   setShowTimePicker(true);
//   // };

//   const open = () => {
//     // 🕒 Default to the *current local time* if no selection yet
//     const now = new Date();
//     const seed = new Date(
//       2000,
//       0,
//       1,
//       startTime?.h ?? now.getHours(),
//       startTime?.m ?? now.getMinutes()
//     );
//     setIosTempTime(seed);
//     setShowTimePicker(true);
//   };  

//   const closeViaScrim = () => {
//     // If user opened and tapped out without a selection,
//     // commit whatever is currently in iosTempTime so we don't leave it empty.
//     if (!startTime) {
//       setStartTime({ h: iosTempTime.getHours(), m: iosTempTime.getMinutes() });
//     }
//     setShowTimePicker(false);
//   };

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.input, styles.center]}
//         onPress={open}
//         activeOpacity={0.8}
//       >
//         <Text style={[styles.inputText, { color: labelColor }]}>{label}</Text>
//       </TouchableOpacity>

//       {showTimePicker && (
//         // Full-coverage overlay INSIDE your existing modal
//         <View
//           style={[
//             StyleSheet.absoluteFill,
//             {
//               zIndex: 1000,
//               elevation: 1000,
//               pointerEvents: "box-none",
//             },
//           ]}
//         >
//           {/* Black scrim that blocks other inputs; tap to close */}
//           <Pressable
//             style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.8)" }]}
//             onPress={closeViaScrim}
//           />

//           {/* Calendar container: fills your modal width with matching padding */}
//           <View
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               paddingHorizontal: 12,
//               paddingVertical: 12,
//               justifyContent: "center",
//               alignItems: "stretch",
//               pointerEvents: "box-none",
//             }}
//           >
//             <View
//               style={{
//                 borderRadius: 12,
//                 width: "100%",
//                 pointerEvents: "auto",
//               }}
//             >
//               <View style={[styles.iosSheet, { marginBottom: 0 }]}>
//                 <DateTimePicker
//                   value={iosTempTime}
//                   mode="time"
//                   display={Platform.OS === "ios" ? "spinner" : "spinner"}
//                   {...(Platform.OS === "ios" ? { locale: "en-US" } : {})}
//                   {...(Platform.OS === "android" ? { is24Hour: false } : {})}
//                   onChange={onChange}
//                   style={[styles.iosPicker, { alignSelf: "stretch" }]}
//                 />
//               </View>
//             </View>
//           </View>
//         </View>
//       )}
//     </>
//   );
// }

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "../../../styles/homeStyles";

/* ---------------------------------------------
 * Minute snapping config
 * -------------------------------------------*/
const MINUTE_STEP = 5;
const MINUTE_OPTIONS = Array.from(
  { length: 60 / MINUTE_STEP },
  (_, i) => i * MINUTE_STEP
);

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

  /* ---------------------------------------------
   * Label
   * -------------------------------------------*/
  const label = startTime
    ? new Date(2000, 0, 1, startTime.h, startTime.m).toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "2-digit" }
      )
    : "Select Time";

  const labelColor = startTime ? "#ffffff" : "#a0a0a0";

  /* ---------------------------------------------
   * Initial picker state (12-hour)
   * -------------------------------------------*/
  const initial = useMemo<{
    hour: number;
    minute: number;
    ampm: "AM" | "PM";
  }>(() => {
    const base = startTime
      ? new Date(2000, 0, 1, startTime.h, startTime.m)
      : new Date();

    let hour24 = base.getHours();
    const ampm: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";

    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    // 🔒 Snap minutes DOWN to nearest 5
    const snappedMinute =
      Math.floor(base.getMinutes() / MINUTE_STEP) * MINUTE_STEP;

    return {
      hour: hour12,
      minute: snappedMinute,
      ampm,
    };
  }, [startTime]);

  const [hour, setHour] = useState<number>(initial.hour);
  const [minute, setMinute] = useState<number>(initial.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(initial.ampm);

  /* ---------------------------------------------
   * Open / Close
   * -------------------------------------------*/
  const open = () => {
    setHour(initial.hour);
    setMinute(initial.minute);
    setAmpm(initial.ampm);
    setShowTimePicker(true);
  };

  const commitAndClose = () => {
    let h = hour % 12;
    if (ampm === "PM") h += 12;

    setStartTime({ h, m: minute });
    setIosTempTime(new Date(2000, 0, 1, h, minute));
    setShowTimePicker(false);
  };

  /* ---------------------------------------------
   * Render
   * -------------------------------------------*/
  return (
    <>
      <TouchableOpacity
        style={[styles.input, styles.center]}
        onPress={open}
        activeOpacity={0.8}
      >
        <Text style={[styles.inputText, { color: labelColor }]}>
          {label}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              zIndex: 1000,
              elevation: 1000,
              pointerEvents: "box-none",
            },
          ]}
        >
          {/* Scrim */}
          <Pressable
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0,0,0,0.85)" },
            ]}
            onPress={commitAndClose}
          />

          {/* Picker container */}
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
                  paddingVertical: 12,
                  pointerEvents: "auto",
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {/* Hour */}
                <Picker
                  selectedValue={hour}
                  onValueChange={setHour}
                  style={{ width: 110 }}
                  itemStyle={{ color: "#ffffff" }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = i + 1;
                    return (
                      <Picker.Item
                        key={h}
                        label={h.toString()}
                        value={h}
                      />
                    );
                  })}
                </Picker>

                {/* Minute (5-min increments) */}
                <Picker
                  selectedValue={minute}
                  onValueChange={setMinute}
                  style={{ width: 110 }}
                  itemStyle={{ color: "#ffffff" }}
                >
                  {MINUTE_OPTIONS.map((m) => (
                    <Picker.Item
                      key={m}
                      label={m.toString().padStart(2, "0")}
                      value={m}
                    />
                  ))}
                </Picker>

                {/* AM / PM */}
                <Picker
                  selectedValue={ampm}
                  onValueChange={(v) => setAmpm(v)}
                  style={{ width: 100 }}
                  itemStyle={{ color: "#ffffff" }}
                >
                  <Picker.Item label="AM" value="AM" />
                  <Picker.Item label="PM" value="PM" />
                </Picker>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
}
