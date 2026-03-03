// components/DeleteConfirmModal.tsx
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import { styles } from "../styles/homeStyles";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  itemType: string;
}

export default function DeleteConfirmModal({ visible, onCancel, onConfirm, itemType }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={deleting ? undefined : onCancel} />
      <View style={styles.modalCardWrap}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            Delete this {itemType}?
          </Text>
          <Text style={styles.modalBody}>This action cannot be undone</Text>
          <View style={[styles.modalRow, { gap: 12 }]}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnGhost, deleting && { opacity: 0.5 }]}
              onPress={onCancel}
              disabled={deleting}
            >
              <Text style={[styles.modalBtnText, styles.modalBtnGhostText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnDanger, deleting && { opacity: 0.5 }]}
              onPress={handleConfirm}
              disabled={deleting}
            >
              <Text style={[styles.modalBtnText, styles.modalBtnDangerText]}>
                {deleting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
