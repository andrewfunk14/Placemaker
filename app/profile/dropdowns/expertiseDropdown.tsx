// dropdowns/expertiseDropdown.tsx
import React from "react";
import ProfileMultiSelectDropdown from "./multiSelectDropdown";

const OPTIONS = [
  "Deal Making",
  "Design",
  "Entitlements",
  "Financing",
  "Leasing",
  "Permitting",
  "Underwriting",
];

interface ExpertiseDropdownProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export default function ExpertiseDropdown({
  value,
  onChange,
}: ExpertiseDropdownProps) {
  return (
    <ProfileMultiSelectDropdown
      label="Expertise"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Expertise"
    />
  );
}
