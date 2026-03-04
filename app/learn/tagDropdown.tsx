// learn/tagDropdown.tsx
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
import { learnStyles as styles, colors } from "../../styles/learnStyles";
import { ChevronDown } from "lucide-react-native";

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
    value.length > 0 ? value.join(", ") : "Topic Tag(s)";

  const handleClear = () => {
    onSelect([]);
  };

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
            value.length === 0 && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <ChevronDown size={24} color="#a0a0a0" strokeWidth={2} />
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

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderTopWidth: 1,
                borderTopColor: "#333",
                paddingVertical: 10,
                paddingHorizontal: 16,
              }}
            >
              <TouchableOpacity
                onPress={handleClear}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#555",
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: "#ccc", fontSize: 16, fontWeight: "500" }}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accent,
                  borderRadius: 10,
                  paddingVertical: 10,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: "#0d0d0d", fontSize: 16, fontWeight: "600" }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
