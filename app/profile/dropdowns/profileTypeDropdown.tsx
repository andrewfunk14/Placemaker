// dropdowns/profileTypeDropdown.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
  Modal,
} from "react-native";
import { profileStyles as styles } from "../../../styles/profileStyles";
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
        <ChevronDown size={22} color="#f5f5f5" strokeWidth={2} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.dropdownList,
              { maxHeight: Math.min(height * 0.7, 420) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <FlatList
              data={TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => {
                const selected = item === value;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      index === TYPES.length - 1 && styles.dropdownItemLast,
                      selected && styles.dropdownItemSelected,
                    ]}
                  >
                    <Text style={[styles.dropdownItemText, selected && styles.dropdownItemTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
