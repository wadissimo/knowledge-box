// app/index.tsx
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";

import { useEffect, useState } from "react";
import Icon from "react-native-ionicons";
import { Box, useBoxModel } from "@/data/BoxModel";
import { useIsFocused } from "@react-navigation/native";

export default function BoxesPage() {
  const router = useRouter();
  const { fetchBoxes } = useBoxModel();

  const isFocused = useIsFocused();
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    if (isFocused) {
      fetchBoxes().then((res) => {
        setBoxes(res);
      });
    }
  }, [isFocused]);

  const handleAddPress = () => {
    router.push("/newBox");
  };
  const handleBoxPress = (boxId: number) => {
    router.push(`box/${boxId}/`);
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search New Collections"
          />
        </View> */}
        <Link href={"/collections"}>
          <Text>Collections</Text>
        </Link>
        <ScrollView>
          <View style={styles.boxesContainer}>
            {boxes.map((box) => (
              <TouchableOpacity
                onPress={() => handleBoxPress(box.id)}
                key={`box_${box.id}`}
              >
                <View style={styles.box}>
                  <Text style={styles.boxHeaderText}>{box.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomPanel}>
          <TouchableOpacity onPress={handleAddPress}>
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
  descInput: {},
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