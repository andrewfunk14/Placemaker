// webStyles.tsx
import React from "react";
import { Platform } from "react-native";

export default function WebStyles() {
  if (Platform.OS !== "web") return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
:root { color-scheme: dark; }

/* Base style for both date and time pickers */
input.pm-dt {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  border: 1px solid gray;
  padding: 12px;
  background: #1a1a1a;
  color: #a0a0a0;
  outline: none;
  margin-bottom: 16px;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

/* Hide the browser's date/time text when no value is set */
input.pm-dt[value=""]::-webkit-datetime-edit {
  color: transparent;
}

/* Always show readable gray selected text when filled */
input.pm-dt:not([value=""])::-webkit-datetime-edit {
  color: #f5f5f5 !important;
}

/* Custom placeholder */
input.pm-dt::before {
  content: attr(data-placeholder);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 400;
  pointer-events: none;
  opacity: 0.9;
}

input.pm-dt[value=""]::-webkit-datetime-edit,
input.pm-dt[value=""]::-webkit-datetime-edit-fields-wrapper,
input.pm-dt[value=""]::-webkit-datetime-edit-year-field,
input.pm-dt[value=""]::-webkit-datetime-edit-month-field,
input.pm-dt[value=""]::-webkit-datetime-edit-day-field,
input.pm-dt[value=""]::-webkit-datetime-edit-text {
  display: none;
  pointer-events: none; /* don't focus the (hidden) edit area */
}

/* Hide custom placeholder once a real value exists */
input.pm-dt:not([value=""])::before {
  content: "";
  opacity: 0;
}

/* Expand indicator to cover the full input — intercepts all clicks, opens picker */
input.pm-dt::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Prevent number fields from receiving focus/highlight on click */
input.pm-dt::-webkit-datetime-edit,
input.pm-dt::-webkit-datetime-edit-fields-wrapper,
input.pm-dt::-webkit-datetime-edit-text,
input.pm-dt::-webkit-datetime-edit-month-field,
input.pm-dt::-webkit-datetime-edit-day-field,
input.pm-dt::-webkit-datetime-edit-year-field,
input.pm-dt::-webkit-datetime-edit-hour-field,
input.pm-dt::-webkit-datetime-edit-minute-field,
input.pm-dt::-webkit-datetime-edit-ampm-field {
  pointer-events: none;
}

/* Prevent autofill background from changing text color */
input.pm-dt:-webkit-autofill {
  -webkit-text-fill-color: #a0a0a0 !important;
  transition: background-color 9999s ease-in-out 0s;
}
      `,
      }}
    />
  );
}

