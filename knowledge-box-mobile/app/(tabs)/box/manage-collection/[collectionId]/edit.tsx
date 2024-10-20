import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { useTheme } from "@react-navigation/native";
import { i18n } from "@/lib/i18n";

const EditCollection = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const { collectionId } = useLocalSearchParams();

  const [name, setName] = useState<string>("");
  const [collection, setCollection] = useState<Collection | null>(null);
  const { updateCollection, getCollectionById } = useCollectionModel();

  useEffect(() => {
    async function updateName() {
      const col = await getCollectionById(Number(collectionId));
      if (col) {
        setName(col.name);
      }
      setCollection(col);
    }
    updateName();
  }, [collectionId]);

  const handleSave = () => {
    if (!name) {
      Alert.alert("Error", "Name must be filled.");
      return;
    }
    if (collection !== null) {
      collection.name = name;
      updateCollection(collection);
    } else {
      throw Error("Empty Collection");
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{i18n.t("cards.collectionName")}</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={i18n.t("cards.collectionName")}
      />

      <Button
        title={i18n.t("common.save")}
        onPress={handleSave}
        color={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    //textAlign: "center",
    color: "#333",
  },
  multilineInput: {},
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

export default EditCollection;
