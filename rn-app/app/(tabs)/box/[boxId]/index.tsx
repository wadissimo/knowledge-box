import { View, Text, Button, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { useIsFocused } from "@react-navigation/native";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import MyCardCollections from "@/components/MyCardCollections";

const BoxContent = () => {
  const router = useRouter();
  const { boxId } = useLocalSearchParams();
  const { fetchCollectionsByBoxId } = useBoxCollectionModel();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchCollectionsByBoxId(Number(boxId)).then((res) => setCollections(res));
    }
  }, [isFocused]);

  function handleAddCollection() {
    router.push(`/(tabs)/box/${boxId}/collections/addCollection`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.colContainer}>
        <Text style={styles.colHeaderText}>My Collections</Text>
        <View style={styles.colListContainer}>
          <MyCardCollections collections={collections} />
        </View>
        <Button
          title="Add Collection"
          onPress={handleAddCollection}
          color={styles.addBtn.color}
        ></Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 20 },
  colContainer: {
    padding: 5,
  },
  colHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  colListContainer: {
    padding: 10,
  },
  addBtn: {
    color: "#4CAF50",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "grey",
    marginVertical: 1,
  },
});

export default BoxContent;
