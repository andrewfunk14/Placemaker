// home/newEventModal/webTime.tsx
import React from "react";
import { Platform, View } from "react-native";
import { styles } from "../../../store/styles/homeStyles";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

type Props = {
  startTime: { h: number; m: number } | null;
  setStartTime: (t: { h: number; m: number } | null) => void;
};

export default function WebTime({ startTime, setStartTime }: Props) {
  if (Platform.OS !== "web") return null;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const [hh, mm] = value.split(":").map(Number);
      setStartTime({ h: hh, m: mm });
    } else {
      setStartTime(null);
    }
  };

  return (
    <View style={[styles.center]}>
      <input
        type="time"
        className="pm-dt"
        value={startTime ? `${pad(startTime.h)}:${pad(startTime.m)}` : ""}
        onChange={handleTimeChange}
        data-placeholder="Select Time"
        required
      />
    </View>
  );
}
