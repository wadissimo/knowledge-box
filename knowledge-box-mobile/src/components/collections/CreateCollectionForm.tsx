import { View, Text, StyleSheet, TextInput, Alert, Button } from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { i18n } from "@/src/lib/i18n";

const CreateCollectionForm: React.FC<{
  onCreate: Function;
}> = ({ onCreate }) => {
  const { colors } = useTheme();
  const [name, setName] = useState<string>("");
  const handleSave = async () => {
    if (!name) {
      Alert.alert("Error", "Name must be filled.");
      return;
    }
    onCreate(name);
  };

  return (
    <View style={styles.newColContainer}>
      <Text style={styles.label}>{i18n.t("cards.createCollection")}</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={i18n.t("cards.collectionName")}
      />

      <Button
        title={i18n.t("common.create")}
        onPress={handleSave}
        color={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  newColContainer: {},

  input: {
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },

  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    //textAlign: "center",
    color: "#333",
  },
  multilineInput: {},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "grey",
    marginVertical: 1,
  },
});

export default CreateCollectionForm;
