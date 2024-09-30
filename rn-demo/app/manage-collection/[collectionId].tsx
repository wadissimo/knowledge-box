// app/manage-collection/[collectionId].tsx
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Image,
  Text,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Card from "../data/Card";
import { SafeAreaView } from "react-native-safe-area-context";

function generateRandomCards(count: number) {
  const countries = ["Italy", "Portugal", "Netherlands", "Belgium", "Greece"];
  const capitals = ["Rome", "Lisbon", "Amsterdam", "Brussels", "Athens"];
  let fakeCards: Card[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * countries.length);
    const frontText = countries[randomIndex];
    const backText = capitals[randomIndex];

    fakeCards.push({
      id: i.toString(), // Ensuring unique id
      frontText,
      backText,
    });
  }
  return fakeCards;
}

export default function ManageCollectionScreen() {
  const { collectionId } = useLocalSearchParams();
  const [cards, setCards] = useState<Card[]>(generateRandomCards(50));
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedCard, setSelectedCard] = useState("2");
  const numCards = cards.length;

  const addCard = () => {
    const newCard: Card = {
      id: Date.now().toString(),
      frontText,
      backText,
      image,
    };
    setCards([...cards, newCard]);
    setFrontText("");
    setBackText("");
    setImage(null);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync();

    // Check if the result has not been canceled and if it includes a 'uri'
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }

    // if (!result.canceled) {
    //   setImage(result.uri);
    // }
  };

  const prevPage = () => {
    setSelectedCard("");
    setPage(page - 1);
  };

  const nextPage = () => {
    setSelectedCard("");
    setPage(page + 1);
  };

  return (
    <View style={styles.container}>
      {/* <TextInput
          placeholder="Front Text"
          value={frontText}
          onChangeText={setFrontText}
        />
        <TextInput
          placeholder="Back Text"
          value={backText}
          onChangeText={setBackText}
        />
        <Button title="Pick Image for Front/Back" onPress={pickImage} />
        {image && (
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
        )}
        <Button title="Add Card" onPress={addCard} /> */}
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={styles.headerItem}>ID</Text>
          <Text style={styles.headerItem}>Front</Text>
          <Text style={styles.headerItem}>Back</Text>
        </View>

        <FlatList
          data={cards.slice(page * perPage, (page + 1) * perPage)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={
                item.id !== selectedCard
                  ? [styles.row]
                  : [styles.row, styles.selectedRow]
              }
              onTouchStart={() => setSelectedCard(item.id)}
            >
              <Text style={styles.rowItem}>{item.id}</Text>
              <Text style={styles.rowItem}>{item.frontText}</Text>
              <Text style={styles.rowItem}>{item.backText}</Text>
            </View>
          )}
          //style={{ flex: 1 }}
          //contentContainerStyle={{ paddingBottom: 100 }}
        />
        <View style={styles.navBtns}>
          <Button title="Prev Page" onPress={prevPage} disabled={page === 0} />
          <View style={styles.spacer}>
            <Text> </Text>
          </View>
          <Button
            title="Next Page"
            onPress={nextPage}
            disabled={numCards <= (page + 1) * perPage}
          />
        </View>
      </View>
      <View style={styles.addCardBtn}>
        <Button title="Add Card" />
      </View>
      {selectedCard && (
        <View style={styles.addCardBtn}>
          <Button title="Edit Card" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1, //doesn't work - collapses the entire table
    padding: 10,
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  table: {
    marginHorizontal: 30,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    backgroundColor: "#666666",
    flexDirection: "column",
    //flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  header: {
    //flex: 1,
    flexDirection: "row",

    backgroundColor: "#808080",
  },
  headerItem: { flex: 1, padding: 5 },
  row: {
    flexDirection: "row",
    backgroundColor: "#909090",
    borderColor: "#777777",
    borderWidth: 1,
  },
  selectedRow: {
    borderColor: "orange",
    borderWidth: 1,
  },
  rowItem: { flex: 1, padding: 5 },
  link: {
    color: "#1010FF",
    textDecorationLine: "underline",
    //fontWeight: "bold",
  },
  navBtns: {
    flexDirection: "row",
  },
  spacer: {
    flex: 1,
  },
  addCardBtn: {
    paddingTop: 20,
  },
});
