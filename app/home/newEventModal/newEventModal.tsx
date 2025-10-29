// home/newEventModal/newEventModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  Modal,
  InputAccessoryView,
  Keyboard,
} from "react-native";
import { useAppDispatch } from "../../../store/hooks";
import { useUser } from "../../userContext";
import { createEvent, fetchEvents, updateEvent, EventRow } from "../../../store/slices/eventsSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { styles } from "../../../styles/homeStyles";
import WebStyles from "./webStyles";
import WebDate from "./webDate";
import WebTime from "./webTime";
import NativeDate from "./nativeDate";
import NativeTime from "./nativeTime";
import { combineDateTime } from "../../../utils/time";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toLocalYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toLocalHHMM = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const tzOffset = (d: Date) => {
  const offMin = -d.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const abs = Math.abs(offMin);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};
const toLocalISOWithTZ = (d: Date) =>
  `${toLocalYYYYMMDD(d)}T${toLocalHHMM(d)}:00${tzOffset(d)}`;

type Props = {
  visible: boolean;
  onClose: () => void;
  event?: EventRow | null;
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
  const [startDay, setStartDay] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<{ h: number; m: number } | null>(null);

  // 👇 field error state
  const [errors, setErrors] = useState<{ title?: string; date?: string; time?: string }>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // iOS picker temps
  const [iosTempDate, setIosTempDate] = useState(new Date());
  const [iosTempTime, setIosTempTime] = useState(new Date());

  // web sheet states
  const [showWebDateSheet, setShowWebDateSheet] = useState(false);
  const [showWebTimeSheet, setShowWebTimeSheet] = useState(false);

  const [clock, setClock] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setClock((x) => x + 1), 60_000); // every minute
    return () => clearInterval(id);
  }, []);

  // prefill edit mode
  useEffect(() => {
    if (!visible) return;
    if (isEdit && event) {
      setTitle(event.title ?? "");
      setAddress(event.address ?? "");
      setDescription(event.description ?? "");
      const d = new Date(event.start_at);
      setStartDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      setStartTime({ h: d.getHours(), m: d.getMinutes() });
      setIosTempDate(d);
      setIosTempTime(d);
    } else reset();
  }, [visible, isEdit, event?.id]);

  useEffect(() => {
    if (!visible) return;
    if (isEdit && event) {
      setTitle(event.title ?? "");
      setAddress(event.address ?? "");
      setDescription(event.description ?? "");
      const d = new Date(event.start_at);
      setStartDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      setStartTime({ h: d.getHours(), m: d.getMinutes() });
      setIosTempDate(d);
      setIosTempTime(d);
      setErrors({});
    } else reset();
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
    setErrors({});
  };

  const close = () => {
    onClose();
    setTimeout(() => reset(), 300);
  };

  const [mode, setMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    if (!visible) return;
    setMode(event ? "edit" : "create");
    if (!event) reset();
  }, [visible, event]);

  const validate = () => {
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return false;
    }
  
    if (!startDay) {
      setErrors({ date: "Date is required" });
      return false;
    }
  
    if (!startTime) {
      setErrors({ time: "Time is required" });
      return false;
    }
  
    // 🧭 Combine date & time
    const candidate = combineDateTime(startDay, startTime);
    const now = new Date();
  
    // Only enforce "future" if creating OR editing a future event
    if (mode === "create") {
      if (candidate <= now) {
        setErrors({ date: "Event must be in the future" });
        return false;
      }
    } else if (mode === "edit") {
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      if (candidate.getTime() + TWO_HOURS_MS < now.getTime()) {
        setErrors({ date: "Event must be 2 hours from current time" });
        return false;
      }
    }
  
    setErrors({});
    return true;
  };  

  // Clear error when field becomes valid
  const onChangeTitle = (v: string) => {
    setTitle(v);
    if (v.trim()) setErrors((e) => ({ ...e, title: undefined }));
  };
  
  const onPickStartDay = (d: Date | null) => {
    setStartDay(d);
    if (d) {
      setErrors((e) => ({ ...e, date: undefined }));
    }
    if (d && startTime) {
      setErrors((e) => ({ ...e, time: undefined }));
    }
  };
  
  const onPickStartTime = (t: { h: number; m: number } | null) => {
    setStartTime(t);
    if (t) {
      setErrors((e) => ({ ...e, time: undefined }));
    }
    if (t && startDay) {
      setErrors((e) => ({ ...e, date: undefined }));
    }
  };

  const save = async () => {
    if (!canEdit) return;
    if (!validate()) return;

    const startDate = combineDateTime(startDay!, startTime!);
    const start_at = toLocalISOWithTZ(startDate);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        address: address || null,
        start_at,
      };
      if (mode === "edit" && event?.id) {
        await dispatch(updateEvent({ id: event.id, changes: payload })).then(unwrapResult);
      } else {
        await dispatch(createEvent(payload)).then(unwrapResult);
      }
      await dispatch(fetchEvents());
      close();
    } catch (e: any) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={close} />
        <WebStyles />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.eventModalCardWrap}
        >
          <View style={styles.eventModalCard}>
            <Text style={styles.modalTitleText}>
              {mode === "edit" ? "Edit Event" : "Create Event"}
            </Text>

            {/* Title */}
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#a0a0a0"
              value={title}
              onChangeText={onChangeTitle}
              autoCapitalize="sentences"
              returnKeyType="done"
            />
            {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}

            {/* Date & Time */}
            {Platform.OS === "web" ? (
              <>
                <WebDate startDay={startDay} setStartDay={onPickStartDay} />
                {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}

                <WebTime startTime={startTime} setStartTime={onPickStartTime} />
                {errors.time ? <Text style={styles.error}>{errors.time}</Text> : null}

              </>
            ) : (
              <>
                <NativeDate
                  startDay={startDay}
                  setStartDay={onPickStartDay}
                  iosTempDate={iosTempDate}
                  setIosTempDate={setIosTempDate}
                  showDatePicker={showDatePicker}
                  setShowDatePicker={setShowDatePicker}
                />
                {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}

                <NativeTime
                  startTime={startTime}
                  setStartTime={onPickStartTime}
                  iosTempTime={iosTempTime}
                  setIosTempTime={setIosTempTime}
                  showTimePicker={showTimePicker}
                  setShowTimePicker={setShowTimePicker}
                />
                {errors.time ? <Text style={styles.error}>{errors.time}</Text> : null}
              </>
            )}

            {/* Location */}
            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#a0a0a0"
              value={address}
              onChangeText={setAddress}
            />

            {/* Description */}
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Description (optional)"
              placeholderTextColor="#a0a0a0"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputAccessoryViewID="done-bar"
            />

            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID="done-bar">
                <View
                  style={{
                    backgroundColor: "#222",
                    padding: 12,
                    borderTopWidth: 0.2,
                    borderTopColor: "#0d0d0d",
                    alignItems: "flex-end",
                  }}
                >
                  <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                    <Text style={{ color: "#2e78b7", fontWeight: "600", fontSize: 20 }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            )}

            {/* Actions */}
            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={close}>
                <Text style={[styles.btnText, styles.btnGhostText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!canEdit || saving}
                style={[styles.btn, (!canEdit || saving) && { opacity: 0.5 }]}
                onPress={save}
              >
                <Text style={styles.btnText}>{saving ? "Saving..." : isEdit ? "Save" : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
