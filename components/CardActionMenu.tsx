// components/CardActionMenu.tsx
import React, { useState, useRef } from "react";
import { TouchableOpacity, Modal, Pressable, View, Text, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles as styles, colors } from "../styles/globalStyles";

export interface CardMenuItem {
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface Props {
  items: CardMenuItem[];
}

export default function CardActionMenu({ items }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const ellipsisRef = useRef<any>(null);

  const openMenu = () => {
    ellipsisRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      setMenuPos({ top: y + h + 4, right: Dimensions.get("window").width - x - w });
      setMenuOpen(true);
    });
  };

  return (
    <>
      <TouchableOpacity
        ref={ellipsisRef}
        style={styles.cardEllipsisButton}
        onPress={openMenu}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={menuOpen}
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)}>
          <View
            style={[styles.cardActionMenu, { top: menuPos.top, right: menuPos.right }]}
            onStartShouldSetResponder={() => true}
          >
            {items.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <View style={styles.cardActionMenuDivider} />}
                <TouchableOpacity
                  style={styles.cardActionMenuItem}
                  onPress={() => { setMenuOpen(false); item.onPress(); }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cardActionMenuText,
                      item.danger && styles.cardActionMenuDangerText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}