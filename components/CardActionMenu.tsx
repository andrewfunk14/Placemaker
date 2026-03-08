// components/CardActionMenu.tsx
import React, { useState, useRef } from "react";
import { TouchableOpacity, Modal, Pressable, View, Text, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles as styles, colors } from "../styles/globalStyles";

export interface CardMenuItem {
  label: string;
  onPress: () => void;
  danger?: boolean;
  icon?: string;
}

interface Props {
  items: CardMenuItem[];
  iconName?: string;
  iconSize?: number;
}

export default function CardActionMenu({ items, iconName = "ellipsis-vertical", iconSize = 24 }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const ellipsisRef = useRef<any>(null);

  const compact = items.every((item) => !!item.icon);

  const openMenu = () => {
    ellipsisRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      setMenuPos({ top: y + h + (Platform.OS === "android" ? 24 : 1), right: Dimensions.get("window").width - x - w });
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
        <Ionicons name={iconName as any} size={iconSize} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        transparent
        statusBarTranslucent
        visible={menuOpen}
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)}>
          <View
            style={[
              styles.cardActionMenu,
              { top: menuPos.top, right: menuPos.right },
              compact && { flexDirection: "row", minWidth: 0, paddingHorizontal: 0 },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {items.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && (
                  <View
                    style={
                      compact
                        ? { width: 1, backgroundColor: colors.translucentBorder }
                        : styles.cardActionMenuDivider
                    }
                  />
                )}
                <TouchableOpacity
                  style={compact ? { padding: 10 } : styles.cardActionMenuItem}
                  onPress={() => { setMenuOpen(false); item.onPress(); }}
                  activeOpacity={0.7}
                >
                  {compact ? (
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.danger ? colors.danger : colors.accent}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.cardActionMenuText,
                        item.danger && styles.cardActionMenuDangerText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
