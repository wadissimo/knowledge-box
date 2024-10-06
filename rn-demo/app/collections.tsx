// app/index.tsx
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import MyCardCollections from "@/components/MyCardCollections";
import { useEffect, useState } from "react";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { useIsFocused } from "@react-navigation/native";

export default function CollectionsScreen() {
  const router = useRouter();

  //const { collections } = useDatabase();
  const { fetchCollections } = useCollectionModel();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isFocused = useIsFocused(); // check if screen is focused

  useEffect(() => {
    if (isFocused) {
      fetchCollections().then((res) => setCollections(res));
    }
  }, [isFocused]);

  if (collections.length === 0) {
    return null;
  }
  const handleAddPress = () => {
    router.push("/manage-collection/new");
  };
  return (
    <View style={styles.container}>
      <View style={styles.colContainer}>
        <Text style={styles.colContainerText}>My Collections</Text>
        <MyCardCollections collections={collections} />
      </View>
      <View>
        <TouchableOpacity style={styles.addColBtn} onPress={handleAddPress}>
          <Text style={styles.addColBtnTxt}>Add Collection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: "column",
    //justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  addColBtn: {
    margin: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#4CAF50",
    color: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addColBtnTxt: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },

  colContainer: {
    flex: 1,
    //backgroundColor: "lightgreen",
    justifyContent: "center",
  },
  colContainerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
});
