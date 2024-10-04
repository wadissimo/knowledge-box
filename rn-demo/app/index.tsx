// app/index.tsx
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";

import { useDatabase } from "@/context/DatabaseContext";
import MyCardCollections from "@/components/MyCardCollections";
import { useState } from "react";
import Icon from "react-native-ionicons";

export default function CollectionsScreen() {
  const router = useRouter();
  const { collections } = useDatabase();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleAddPress = () => {
    router.push("/manage-collection/new");
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search New Collections"
          />
        </View>
        <ScrollView>
          <View style={styles.boxesContainer}>
            <View style={styles.box}>
              <Text style={styles.boxHeaderText}>Geography</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxHeaderText}>French</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxHeaderText}>History</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxHeaderText}>React Native</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxHeaderText}>Ai</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxHeaderText}>Chinese</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomPanel}>
          <TouchableOpacity>
            <View style={styles.addBoxBtn}>
              {/* <Text style={styles.addBoxBtnTxt}>+</Text> */}
              <Icon name="add" color="white" size={42} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: "column",
    //justifyContent: "center",
    //alignItems: "center",
    width: "100%",
    height: "100%",
  },
  boxesContainer: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  box: {
    backgroundColor: "#78ca7c",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderRadius: 20,
    height: 100,
    width: 280,
    elevation: 10,
    margin: 10,
  },
  boxHeaderText: {
    fontSize: 18,
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
  bottomPanel: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addBoxBtn: {
    backgroundColor: "#1da422",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -10,
    alignSelf: "center", // Center horizontally
  },
  addBoxBtnTxt: {
    color: "white",
    fontSize: 56,
    fontWeight: "bold",
  },
});
