// dropdowns/profileTypeDropdown.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { profileStyles as styles, colors } from "../../../styles/profileStyles";
import { ChevronDown } from "lucide-react-native";

const TYPES = [
  "Developer",
  "Architect",
  "Engineer",
  "Builder",
  "Planner",
  "Capital Partner",
  "Attorney",
  "Marketer",
  "Property Manager",
  "Public Official",
];

interface ProfileTypeDropdownProps {
  value: string | null;
  onSelect: (type: string) => void;
}

export default function ProfileTypeDropdown({
  value,
  onSelect,
}: ProfileTypeDropdownProps) {
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
            (!value || value.trim() === "") && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {value && value.trim() !== "" ? value : "Select Role"}
        </Text>
        <ChevronDown size={22} color="#fff" strokeWidth={2} />
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
            { maxHeight: Math.min(height * 0.7, 420) },
          ]}
        >
          <FlatList
            data={TYPES}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                style={[
                  styles.dropdownItem,
                  index === TYPES.length - 1 && styles.dropdownItemLast,
                ]}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
