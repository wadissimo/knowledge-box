import { View, Text, TextInput, StyleSheet, Button, Image } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useBoxModel } from "@/src/data/BoxModel";


const ManageBox = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const { newBox } = useBoxModel();

  const router = useRouter();

  async function handleSave() {
    await newBox(name, description, null);
    router.back();
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.boxTitle}>
        <Text style={styles.boxTitleText}>Create Box</Text>
      </View> */}
      <View>
        <Text style={styles.formText}>Box Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
        />
      </View>
      <View>
        <Text style={styles.formText}>Description</Text>
        <TextInput
          style={[styles.input, { height: 150 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          numberOfLines={4}
        />
      </View>
      <Button title="Create" onPress={handleSave} color="#000" />
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
