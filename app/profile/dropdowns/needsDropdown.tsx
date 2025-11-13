// dropdowns/needsDropdown.tsx
import React from "react";
import ProfileMultiSelectDropdown from "./multiSelectDropdown";

const OPTIONS = [
  "Capital",
  "Consultants",
  "Sites",
  "Partners",
  "Approvals",
  "Design Team",
  "Construction Resources",
];

interface NeedsDropdownProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export default function NeedsDropdown({ value, onChange }: NeedsDropdownProps) {
  return (
    <ProfileMultiSelectDropdown
      label="Needs"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Needs"
    />
  );
}
