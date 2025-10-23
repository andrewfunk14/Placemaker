// app/NewEventModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppDispatch } from "../../store/hooks";
import { useUser } from "../../app/userContext";
import { createEvent, fetchEvents, updateEvent, EventRow } from "../../store/slices/eventsSlice";
import { unwrapResult } from "@reduxjs/toolkit";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toLocalYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toLocalHHMM = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// timezone-safe formatting (prevents UTC drift)
const tzOffset = (d: Date) => {
  const offMin = -d.getTimezoneOffset(); // positive => east of UTC
  const sign = offMin >= 0 ? "+" : "-";
  const abs = Math.abs(offMin);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};
const toLocalISOWithTZ = (d: Date) =>
  `${toLocalYYYYMMDD(d)}T${toLocalHHMM(d)}:00${tzOffset(d)}`;

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Pass an event to edit; omit for create mode */
  event?: EventRow | null;
  /** Current signed-in user id, used to validate edit permission */
  currentUserId: string | null;
};

export default function NewEventModal({ visible, onClose, event, currentUserId }: Props) {
  const dispatch = useAppDispatch();
  const { roles } = useUser();
  const isEdit = !!event;
  const isCreator = isEdit ? event?.created_by === currentUserId : false;
  const canCreate = roles?.includes("placemaker");
  const canEdit = isEdit ? isCreator : canCreate;

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // final selected values
  const [startDay, setStartDay] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<{ h: number; m: number } | null>(null);

  // native (iOS/Android) sheet visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // native temp values (only commit on Done)
  const [iosTempDate, setIosTempDate] = useState<Date>(new Date());
  const [iosTempTime, setIosTempTime] = useState<Date>(new Date());

  // WEB: sheet + temp (because native web popups auto-close)
  const [showWebDateSheet, setShowWebDateSheet] = useState(false);
  const [showWebTimeSheet, setShowWebTimeSheet] = useState(false);
  const [webTempDate, setWebTempDate] = useState<string>(""); // "YYYY-MM-DD"
  const [webTempTime, setWebTempTime] = useState<string>(""); // "HH:MM"

  useEffect(() => {
    if (!visible) return;
    if (isEdit && event) {
      setTitle(event.title ?? "");
      setAddress(event.address ?? "");
      setDescription(event.description ?? "");
      // parse event.start_at into local date + time
      const d = new Date(event.start_at);
      setStartDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      setStartTime({ h: d.getHours(), m: d.getMinutes() });
      setIosTempDate(d);
      setIosTempTime(d);
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowWebDateSheet(false);
      setShowWebTimeSheet(false);
    } else {
      // create mode -> ensure blank
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isEdit, event?.id]);

  const reset = () => {
    setTitle("");
    setAddress("");
    setDescription("");
    setStartDay(null);
    setStartTime(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowWebDateSheet(false);
    setShowWebTimeSheet(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const combineDateTime = (day: Date, hm: { h: number; m: number }) =>
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), hm.h, hm.m, 0, 0);

  const save = async () => {
    if (!canEdit) {
      Alert.alert(isEdit ? "Only the creator can edit this event." : "Only Placemakers can create events.");
      return;
    }
    if (!title.trim() || !startDay || !startTime) {
      Alert.alert("Missing info", "Please enter title, date, and time.");
      return;
    }

    const startDate = combineDateTime(startDay, startTime);
    const start_at = toLocalISOWithTZ(startDate); // includes e.g. -06:00

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        address: address || null,
        start_at,
        end_at: null,
      };

      if (isEdit && event?.id) {
        await dispatch(updateEvent({ id: event.id, changes: payload })).then(unwrapResult);
      } else {
        await dispatch(createEvent(payload)).then(unwrapResult);
      }
      await dispatch(fetchEvents());
      close();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message ?? (isEdit ? "Failed to update event." : "Failed to create event."));
    } finally {
      setSaving(false);
    }
  };

  // ---------- WEB SHEETS (stay open until Done/Cancel) ----------
  const WebDate = () => {
    if (Platform.OS !== "web") return null;
    const label = startDay
      ? startDay.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "Select Date";

    return (
      <>
        <View
          style={[styles.input, styles.center]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => {
            setWebTempDate(startDay ? toLocalYYYYMMDD(startDay) : "");
            setShowWebDateSheet(true);
          }}
        >
          <Text style={styles.inputText}>{label}</Text>
        </View>

        {showWebDateSheet && (
          <View style={styles.iosSheet}>
            <View style={styles.iosSheetBar}>
              <TouchableOpacity onPress={() => setShowWebDateSheet(false)}>
                <Text style={styles.sheetBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (webTempDate) {
                    const [y, m, d] = webTempDate.split("-").map(Number);
                    setStartDay(new Date(y, m - 1, d, 0, 0, 0));
                  } else {
                    setStartDay(null);
                  }
                  setShowWebDateSheet(false);
                }}
              >
                <Text style={[styles.sheetBtnText, { color: "#ffd21f", fontWeight: "800" }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 12 }}>
              <input
                type="date"
                className="pm-dt"
                value={webTempDate}
                onChange={(e: any) => setWebTempDate(e.target.value)}
              />
            </View>
          </View>
        )}
      </>
    );
  };

  const WebTime = () => {
    if (Platform.OS !== "web") return null;
    const label = startTime
      ? new Date(2000, 0, 1, startTime.h, startTime.m).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "Select Time";

    return (
      <>
        <View
          style={[styles.input, styles.center]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => {
            setWebTempTime(startTime ? `${pad(startTime.h)}:${pad(startTime.m)}` : "");
            setShowWebTimeSheet(true);
          }}
        >
          <Text style={styles.inputText}>{label}</Text>
        </View>

        {showWebTimeSheet && (
          <View style={styles.iosSheet}>
            <View style={styles.iosSheetBar}>
              <TouchableOpacity onPress={() => setShowWebTimeSheet(false)}>
                <Text style={styles.sheetBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (webTempTime) {
                    const [hh, mm] = webTempTime.split(":").map(Number);
                    setStartTime({ h: hh, m: mm });
                  } else {
                    setStartTime(null);
                  }
                  setShowWebTimeSheet(false);
                }}
              >
                <Text style={[styles.sheetBtnText, { color: "#ffd21f", fontWeight: "800" }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 12 }}>
              <input
                type="time"
                className="pm-dt"
                value={webTempTime}
                onChange={(e: any) => setWebTempTime(e.target.value)}
              />
            </View>
          </View>
        )}
      </>
    );
  };

  // ---------- NATIVE PICKERS (iOS/Android) ----------
  const NativeDate = () => {
    if (Platform.OS === "web") return null;

    const label = startDay
      ? startDay.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
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
                <Text style={[styles.sheetBtnText, { color: "#ffd21f", fontWeight: "800" }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={iosTempDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "spinner"} // iOS inline; Android spinner
              {...(Platform.OS === "ios" ? { locale: "en-US" } : {})} // shows "Oct 2025" header
              onChange={(_, date) => {
                if (date) setIosTempDate(date); // don't close here
              }}
              style={styles.iosPicker}
            />
          </View>
        )}
      </>
    );
  };

  const NativeTime = () => {
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
                  setStartTime({ h: iosTempTime.getHours(), m: iosTempTime.getMinutes() });
                  setShowTimePicker(false);
                }}
              >
                <Text style={[styles.sheetBtnText, { color: "#ffd21f", fontWeight: "800" }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={iosTempTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "spinner"}
              {...(Platform.OS === "ios" ? { locale: "en-US" } : {})}  // AM/PM on iOS
              {...(Platform.OS === "android" ? { is24Hour: false } : {})} // 12h on Android
              onChange={(_, date) => {
                if (date) setIosTempTime(date); // do NOT close here
              }}
              style={styles.iosPicker}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <View style={styles.root}>
        {/* Backdrop (transparent dim) */}
        <Pressable style={styles.backdrop} onPress={close}>
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.75)"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Pressable>

        {/* Web-only styles for inputs/icons */}
        <WebStyles />

        {/* Card */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.cardWrap}>
          {/* invisible overlay to tap-out and close any sheet */}
          {(showDatePicker || showTimePicker || showWebDateSheet || showWebTimeSheet) && (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                if (showDatePicker) setShowDatePicker(false);
                if (showTimePicker) setShowTimePicker(false);
                if (showWebDateSheet) setShowWebDateSheet(false);
                if (showWebTimeSheet) setShowWebTimeSheet(false);
              }}
            />
          )}

          <View style={styles.card}>
            <Text style={styles.title}>{isEdit ? "Edit Event" : "Create Event"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#a0a0a0"
              value={title}
              onChangeText={setTitle}
            />

            {/* Date + Time fields */}
            {Platform.OS === "web" ? (
              <>
                <WebDate />
                <WebTime />
              </>
            ) : (
              <>
                <NativeDate />
                <NativeTime />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#a0a0a0"
              value={address}
              onChangeText={setAddress}
            />

            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Description (optional)"
              placeholderTextColor="#a0a0a0"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={close}>
                <Text style={[styles.btnText, styles.btnGhostText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!canEdit || saving}
                style={[styles.btn, (!canEdit || saving) && { opacity: 0.5 }]}
                onPress={save}
              >
                <Text style={styles.btnText}>{saving ? "Saving..." : isEdit ? "Update" : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const WebStyles = () =>
  Platform.OS === "web" ? (
    <style
      dangerouslySetInnerHTML={{
        __html: `
:root { color-scheme: dark; }
input.pm-dt {
  width: 93%;
  height: 48px;
  border-radius: 8px;
  border: 1px solid gray;
  padding: 0 12px;
  background: #1c1c1c;
  color: #a0a0a0;
  outline: none;
  margin-bottom: 16px;
}
input.pm-dt::-webkit-datetime-edit,
input.pm-dt::-webkit-datetime-edit-year-field,
input.pm-dt::-webkit-datetime-edit-month-field,
input.pm-dt::-webkit-datetime-edit-day-field,
input.pm-dt::-webkit-datetime-edit-hour-field,
input.pm-dt::-webkit-datetime-edit-minute-field,
input.pm-dt::-webkit-datetime-edit-ampm-field {
  color: #a0a0a0;
}
input.pm-dt::-webkit-calendar-picker-indicator {
  -webkit-mask: center / 16px 16px no-repeat
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1zm12 7H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9z"/></svg>');
  mask: center / 16px 16px no-repeat
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1zm12 7H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9z"/></svg>');
  opacity: 1;
  cursor: pointer;
}
@-moz-document url-prefix() {
  input.pm-dt {
    background-color: #1c1c1c;
    color: #a0a0a0;
    border-color: #a0a0a0;
  }
}
input.pm-dt:-webkit-autofill {
  -webkit-text-fill-color: #a0a0a0 !important;
  transition: background-color 9999s ease-in-out 0s;
}
      `,
      }}
    />
  ) : null;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center" },
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  cardWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 16, zIndex: 2 },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#0d0d0d",
    borderWidth: 2,
    borderColor: "#ffd21f",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
      default: {},
    }),
  },
  title: { color: "#ffd21f", textAlign: "center", fontSize: 28, fontWeight: "700", marginBottom: 16 },
  locked: { color: "#ffdd66", marginBottom: 10 },
  label: { color: "#ffd21f", fontWeight: "800", marginTop: 8, marginBottom: 4 },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#1c1c1c",
    color: "#a0a0a0",
    marginBottom: 12,
    fontSize: 16,
  },
  textarea: {
    height: 110,
    paddingTop: 10,
  },
  inputText: { color: "#a0a0a0", fontSize: 16 },
  center: { justifyContent: "center" },
  row: { flexDirection: "row", gap: 12, justifyContent: "center" },

  iosSheet: {
    backgroundColor: "#0d0d0d",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
    marginBottom: 12,
    overflow: "hidden",
    zIndex: 2,
  },
  iosSheetBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  sheetBtnText: { color: "#ccc", fontSize: 18, fontWeight: "700" },

  btn: { backgroundColor: "#ffd21f", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnText: { color: "#000", fontSize: 20, fontWeight: "700" },
  btnGhost: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#ffd21f" },
  btnGhostText: { color: "#ffd21f" },

  iosPicker: {
    alignSelf: "stretch",
    backgroundColor: "#0d0d0d",
    ...Platform.select({
      ios: { height: 320 },
      android: { height: 0 }, 
    }),
  },
});
