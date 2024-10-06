import { View, Text, TextInput, StyleSheet, Button, Alert } from "react-native";
import React, { useState } from "react";
import { useCollectionModel } from "@/data/CollectionModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import SeparatorWithText from "@/components/utils/SeparatorWithText";
import CreateCollectionForm from "@/components/collections/CreateCollectionForm";

const AddCollection = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { newCollection } = useCollectionModel();
  const { newBoxCollection } = useBoxCollectionModel();
  const { boxId } = useLocalSearchParams();
  const router = useRouter();

  const handleCollectionCreate = async (name: string) => {
    const colId = await newCollection(name);
    await newBoxCollection(Number(boxId), colId);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchText}>Search</Text>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Collections"
          />
        </View>
      </View>
      <View style={styles.searchResult}>
        <Text> </Text>
      </View>
      <SeparatorWithText text="or" />
      <CreateCollectionForm onCreate={handleCollectionCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    flex: 0,
  },

  searchResult: {
    flex: 1,
  },
  searchText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  searchBar: {},
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
