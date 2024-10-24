import { View, Text, TextInput, StyleSheet, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Box, useBoxModel } from "@/src/data/BoxModel";
import { useTheme } from "@react-navigation/native";
import { i18n } from "@/src/lib/i18n";

const ManageBox = () => {
  const { colors } = useTheme();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { boxId } = useLocalSearchParams();
  const [box, setBox] = useState<Box | null>(null);

  const { newBox, updateBox, getBoxById } = useBoxModel();

  const router = useRouter();

  useEffect(() => {
    getBoxById(Number(boxId)).then((res) => {
      if (res) {
        setBox(res);
        setName(res.name);
        setDescription(res.description ?? "");
      }
    });
  }, [boxId]);

  async function handleSave() {
    if (!box) return;
    box.name = name;
    box.description = description;
    await updateBox(box);
    router.back();
  }

  if (box === null) return null;

  return (
    <View style={styles.container}>
      {/* <View style={styles.boxTitle}>
        <Text style={styles.boxTitleText}>Create Box</Text>
      </View> */}
      <View>
        <Text style={styles.formText}>{i18n.t("boxes.boxName")}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={i18n.t("boxes.boxName")}
        />
      </View>
      <View>
        <Text style={styles.formText}>{i18n.t("boxes.description")}</Text>
        <TextInput
          style={[styles.input, { height: 150 }]}
          value={description}
          onChangeText={setDescription}
          placeholder={i18n.t("boxes.description")}
          multiline
          numberOfLines={4}
        />
      </View>
      <Button
        title={i18n.t("boxes.save")}
        onPress={handleSave}
        color={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  formText: {
    fontSize: 24,
  },
  boxTitle: {
    justifyContent: "center",
    alignItems: "center",
  },
  boxTitleText: {
    fontSize: 32,
    fontWeight: "bold",
  },
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
});

export default ManageBox;
