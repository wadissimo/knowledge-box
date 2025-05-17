import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { i18n } from "@/src/lib/i18n";
import { Colors } from "@/src/constants/Colors";

interface AIErrorModalProps {
  visible: boolean;
  onTryAgain: () => void;
  onCancel: () => void;
}

export const AIErrorModal: React.FC<AIErrorModalProps> = ({ visible, onTryAgain, onCancel }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onCancel}
  >
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" }}>
      <View style={{ width: "90%", backgroundColor: "#fff", borderRadius: 18, padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>{i18n.t("cards.noSuggestedCardsTitle") || "No Cards Suggested"}</Text>
        <Text style={{ fontSize: 15, marginBottom: 18 }}>{i18n.t("cards.noSuggestedCardsMsg") || "No cards were suggested by AI. Please modify your prompt and try again."}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: Colors.light.tint, borderRadius: 8, padding: 10, marginRight: 8, alignItems: "center" }}
            onPress={onTryAgain}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{i18n.t("common.tryAgain") || "Edit Prompt & Try Again"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: Colors.light.deleteBtn, borderRadius: 8, padding: 10, alignItems: "center" }}
            onPress={onCancel}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{i18n.t("common.cancel") || "Cancel"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
