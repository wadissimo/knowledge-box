// app/index.tsx
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { useDatabase } from "@/context/DatabaseContext";
import MyCardCollections from "@/components/MyCardCollections";
import { useState } from "react";

export default function CollectionsScreen() {
  const router = useRouter();
  const { collections } = useDatabase();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleAddPress = () => {
    router.push("/manage-collection/new");
  };
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search New Collections"
        />
      </View>
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
  searchBar: {
    marginTop: 50,
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
