import { View, Text, TextInput, StyleSheet, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Box, useBoxModel } from "@/data/BoxModel";

const ManageBox = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isPublic, setPublic] = useState<boolean>(false);
  const { boxId } = useLocalSearchParams();
  const isNew = boxId === "new";
  const { getBoxById, updateBox, newBox } = useBoxModel();

  const router = useRouter();
  const navigation = useNavigation();
  var box: Box | null = null;

  useEffect(() => {
    if (!isNew) {
      navigation.setOptions({
        title: "Update Box",
      });
      getBoxById(Number(boxId)).then((res) => {
        if (res !== null) {
          box = res;
          setName(box.name);
          setDescription(box.description ?? "");
          setPublic(box.public);
        } else {
          throw Error("Box doesn't exist");
        }
      });
    } else {
      // reset
      navigation.setOptions({
        title: "New Box",
      });
    }
  }, [boxId]);

  async function handleSave() {
    if (isNew) {
      await newBox(name, description, null);
    } else {
      if (box !== null) {
        box.name = name;
        box.description = description;
        box.public = isPublic;
        await updateBox(box);
      }
    }
    router.back();
  }

  return (
    <View>
      <View>
        <Text>{isNew ? "Create" : "Edit"} Box</Text>
      </View>
      <View>
        <Text>Box Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
        />
      </View>
      <View>
        <Text>Description</Text>
        <TextInput
          style={[styles.input, { height: 150 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          numberOfLines={4}
        />
      </View>
      <Button
        title={isNew ? "Create" : "Save"}
        onPress={handleSave}
        color="#4CAF50"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
