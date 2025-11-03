// learn/resourceTagDropdown.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";
import Modal from "react-native-modal";
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import { ChevronDown, Check } from "lucide-react-native";

// 🏷️ Resource topic options
const RESOURCE_TAGS = [
  "Deal Making",
  "Design",
  "Entitlements",
  "Financing",
  "Leasing",
  "Permitting",
  "Underwriting",
];

interface ResourceTagDropdownProps {
  value: string[];
  onSelect: (tags: string[]) => void;
}

export default function ResourceTagDropdown({
  value,
  onSelect,
}: ResourceTagDropdownProps) {
  const [open, setOpen] = useState(false);
  const { height } = Dimensions.get("window");

  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      onSelect(value.filter((t) => t !== tag));
    } else {
      onSelect([...value, tag]);
    }
  };

  const displayText =
    value.length > 0 ? value.join(", ") : "Topic Tags";

  return (
    <View style={styles.dropdownContainer}>
      {/* Dropdown trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.dropdownButton}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            styles.dropdownValue,
            value.length === 0 && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <ChevronDown size={20} color="#fff" strokeWidth={2} />
      </TouchableOpacity>

      {/* Modal dropdown list */}
      <Modal
        isVisible={open}
        onBackdropPress={() => setOpen(false)}
        backdropColor={colors.modalBackdrop}
        backdropOpacity={0.8}
        animationIn="fadeIn"
        animationOut="fadeOut"
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
            data={RESOURCE_TAGS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const selected = value.includes(item);
              return (
                <Pressable
                  onPress={() => toggleTag(item)}
                  style={[
                    styles.dropdownItem,
                    selected && styles.dropdownItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selected && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />

          <Pressable style={styles.dropdownDoneButton} onPress={() => setOpen(false)}>
            <Text style={styles.dropdownDoneText}>Done</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
