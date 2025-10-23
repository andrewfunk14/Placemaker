// home/newEventModal/webDate.tsx
import React from "react";
import { Platform, View } from "react-native";
import { styles } from "../../../store/styles/homeStyles";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toLocalYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

type Props = {
  startDay: Date | null;
  setStartDay: (d: Date | null) => void;
};

export default function WebDate({ startDay, setStartDay }: Props) {
  if (Platform.OS !== "web") return null;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setStartDay(new Date(y, m - 1, d, 0, 0, 0));
  
      requestAnimationFrame(() => {
        e.target.showPicker?.();
      });
    } else {
      setStartDay(null);
    }
  };  

  return (
    <View style={[styles.center]}>
      <input
        type="date"
        className="pm-dt"
        value={startDay ? toLocalYYYYMMDD(startDay) : ""}
        onChange={handleDateChange}
        data-placeholder="Select Date"
        required
      />
    </View>
  );
}
