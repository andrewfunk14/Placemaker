// learn/tierDropdown.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import { ChevronDown } from "lucide-react-native";

const TIER_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Placemaker", value: "paid" },
];

interface ResourceTierDropdownProps {
  value: "free" | "paid" | null;
  onSelect: (tier: "free" | "paid") => void;
}

export default function ResourceTierDropdown({
  value,
  onSelect,
}: ResourceTierDropdownProps) {
  const [open, setOpen] = useState(false);
  const { height } = Dimensions.get("window");

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.dropdownButton}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            styles.dropdownValue,
            !value && styles.dropdownPlaceholder,
          ]}
        >
          {value
            ? TIER_OPTIONS.find((o) => o.value === value)?.label
            : "Select Tier"}
        </Text>
        <ChevronDown size={24} color="#a0a0a0" strokeWidth={2} />
      </TouchableOpacity>

      <Modal
        isVisible={open}
        onBackdropPress={() => setOpen(false)}
        backdropColor={colors.modalBackdrop}
        backdropOpacity={0.8}
        useNativeDriver
        style={styles.dropdownModal}
      >
        <View
          style={[
            styles.dropdownList,
            { maxHeight: Math.min(height * 0.7, 300) },
          ]}
        >
          <FlatList
            data={TIER_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.value as "free" | "paid");
                  setOpen(false);
                }}
                style={[
                  styles.dropdownItem,
                ]}
              >
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
