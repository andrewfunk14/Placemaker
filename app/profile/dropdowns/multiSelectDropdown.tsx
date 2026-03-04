// dropdowns/multiSelectDropdown.tsx
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

interface Props {
  label?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export default function ProfileMultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Select",
}: Props) {
  const [open, setOpen] = useState(false);
  const { height } = Dimensions.get("window");

  const toggle = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  const displayText = value.length > 0 ? value.join(", ") : placeholder;
  const handleClear = () => onChange([]);

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
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = value.includes(item);
                return (
                  <Pressable
                    onPress={() => toggle(item)}
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

            <View style={styles.dropdownFooter}>
              <TouchableOpacity
                onPress={handleClear}
                style={[styles.dropdownFooterButton, styles.dropdownFooterClear]}
              >
                <Text style={styles.dropdownFooterClearText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={[styles.dropdownFooterButton, styles.dropdownFooterDone]}
              >
                <Text style={styles.dropdownFooterDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
