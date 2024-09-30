import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDatabase } from "@/context/DatabaseContext";

const AddCollection = () => {
  const router = useRouter();

  const { collectionId } = useLocalSearchParams();

  const [name, setName] = useState<string>("");
  const { newCollection } = useDatabase();

  useEffect(() => {
    setName("");
  }, [collectionId]);

  const handleSave = () => {
    if (!name) {
      Alert.alert("Error", "Name must be filled.");
      return;
    }
    newCollection(name);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>New Collection</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Collection Name"
      />

      <Button title="Save" onPress={handleSave} color="#4CAF50" />
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

export default AddCollection;
