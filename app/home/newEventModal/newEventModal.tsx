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
  Alert,
  InputAccessoryView,
  Keyboard,
} from "react-native";
import { useAppDispatch } from "../../../store/hooks";
import { useUser } from "../../userContext";
import { createEvent, fetchEvents, updateEvent, EventRow } from "../../../store/slices/eventsSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { styles } from "../../../store/styles/homeStyles";
import WebStyles from "./webStyles";
import WebDate from "./webDate";
import WebTime from "./webTime";
import NativeDate from "./nativeDate";
import NativeTime from "./nativeTime";

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

  // picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // iOS picker temps
  const [iosTempDate, setIosTempDate] = useState(new Date());
  const [iosTempTime, setIosTempTime] = useState(new Date());

  // web sheet states
  const [showWebDateSheet, setShowWebDateSheet] = useState(false);
  const [showWebTimeSheet, setShowWebTimeSheet] = useState(false);
  const [webTempDate, setWebTempDate] = useState("");
  const [webTempTime, setWebTempTime] = useState("");

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
    onClose();
    setTimeout(() => {
      reset();
    }, 300);
  };  

  const combineDateTime = (day: Date, hm: { h: number; m: number }) =>
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), hm.h, hm.m);

  const [mode, setMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    if (!visible) return;
    if (event) {
      setMode("edit");
    } else {
      setMode("create");
      reset();
    }
  }, [visible, event]);

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
    const start_at = toLocalISOWithTZ(startDate);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        address: address || null,
        start_at,
        end_at: null,
      };
      if (mode === "edit" && event?.id) {
        await dispatch(updateEvent({ id: event.id, changes: payload })).then(unwrapResult);
      } else {
        await dispatch(createEvent(payload)).then(unwrapResult);
      }      
      await dispatch(fetchEvents());
      close();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={close}></Pressable>
        <WebStyles />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.eventModalCardWrap}>
          <View style={styles.eventModalCard}>
            <Text style={styles.modalTitleText}>
              {mode === "edit" ? "Edit Event" : "Create Event"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#a0a0a0"
              value={title}
              onChangeText={setTitle}
            />

            {Platform.OS === "web" ? (
              <>
                <WebDate
                  startDay={startDay}
                  setStartDay={setStartDay}
                  // showWebDateSheet={showWebDateSheet}
                  // setShowWebDateSheet={setShowWebDateSheet}
                  // webTempDate={webTempDate}
                  // setWebTempDate={setWebTempDate}
                />
                <WebTime
                  startTime={startTime}
                  setStartTime={setStartTime}
                  // showWebTimeSheet={showWebTimeSheet}
                  // setShowWebTimeSheet={setShowWebTimeSheet}
                  // webTempTime={webTempTime}
                  // setWebTempTime={setWebTempTime}
                />
              </>
            ) : (
              <>
                <NativeDate
                  startDay={startDay}
                  setStartDay={setStartDay}
                  iosTempDate={iosTempDate}
                  setIosTempDate={setIosTempDate}
                  showDatePicker={showDatePicker}
                  setShowDatePicker={setShowDatePicker}
                />
                <NativeTime
                  startTime={startTime}
                  setStartTime={setStartTime}
                  iosTempTime={iosTempTime}
                  setIosTempTime={setIosTempTime}
                  showTimePicker={showTimePicker}
                  setShowTimePicker={setShowTimePicker}
                />
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
              inputAccessoryViewID="done-bar"
            />

            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID="done-bar">
                <View
                  style={{
                    backgroundColor: "#222",
                    padding: 12,
                    borderTopWidth: .2,
                    borderTopColor: "#0d0d0d",
                    alignItems: "flex-end",
                  }}
                >
                  <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                    <Text style={{ color: "#2e78b7", fontWeight: "600", fontSize: 20 }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            )}

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
