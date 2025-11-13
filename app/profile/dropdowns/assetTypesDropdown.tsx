// dropdowns/assetTypesDropdown.tsx
import React from "react";
import ProfileMultiSelectDropdown from "./multiSelectDropdown";

const OPTIONS = [
  "Multifamily",
  "Office",
  "Industrial",
  "Retail",
  "Hospitality",
  "Mixed-Use",
  "Land",
];

interface AssetTypesDropdownProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export default function AssetTypesDropdown({
  value,
  onChange,
}: AssetTypesDropdownProps) {
  return (
    <ProfileMultiSelectDropdown
      label="Asset Types"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Asset Types"
    />
  );
}
