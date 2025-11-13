// dropdowns/marketsDropdown.tsx
import React from "react";
import ProfileMultiSelectDropdown from "./multiSelectDropdown";

const OPTIONS = [
  "Northeast",
  "Southeast",
  "Midwest",
  "Southwest",
  "West Coast",
  "Mountain West",
  "International",
];

interface MarketsDropdownProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export default function MarketsDropdown({
  value,
  onChange,
}: MarketsDropdownProps) {
  return (
    <ProfileMultiSelectDropdown
      label="Markets"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Markets"
    />
  );
}
