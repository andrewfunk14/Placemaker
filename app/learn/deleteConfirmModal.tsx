// learn/deleteConfirmModal.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import { styles } from "../../styles/homeStyles";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ visible, onCancel, onConfirm }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel} />
      <View style={styles.modalCardWrap}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Delete this resource?</Text>
          <Text style={styles.modalBody}>This action cannot be undone</Text>
          <View style={[styles.modalRow, { gap: 12 }]}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={onCancel}>
              <Text style={[styles.modalBtnText, styles.modalBtnGhostText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={onConfirm}>
              <Text style={[styles.modalBtnText, styles.modalBtnDangerText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
