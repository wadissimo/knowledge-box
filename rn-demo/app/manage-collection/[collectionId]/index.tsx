// app/manage-collection/[collectionId].tsx
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Image,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { SafeAreaView } from "react-native-safe-area-context";

import { Card, useDatabase } from "@/context/DatabaseContext";

function generateRandomCards(count: number) {
  const countries = [
    ".",
    "Portugal",
    "Netherlands very long name",
    "Belgium",
    "Greece",
  ];
  const capitals = [".", "Lisbon", "Amsterdam", "Brussels", "Athens"];
  let fakeCards: Card[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * countries.length);
    const front = countries[randomIndex];
    const back = capitals[randomIndex];

    fakeCards.push({
      id: i, // Ensuring unique id
      front,
      back,
      collectionId: 1,
    });
  }
  return fakeCards;
}

export default function ManageCollectionScreen() {
  const router = useRouter();
  const { collectionId, affectedCardId } = useLocalSearchParams<{
    collectionId?: string;
    affectedCardId?: string;
  }>();

  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedCard, setSelectedCard] = useState<number | null>(2);

  const { deleteCollection, getCards, deleteCard } = useDatabase();
  const [cards, setCards] = useState<Card[]>([]);
  const numCards = cards.length;

  const prevPageDisabled = page === 0;
  const nextPageDisabled = numCards <= (page + 1) * perPage;

  async function fetchCards() {
    var cards = await getCards(collectionId);
    setCards(cards);
    if (affectedCardId) {
      if (affectedCardId == "-1") {
        // choose last card
        if (cards.length > 0) {
          setPage(Math.ceil(cards.length / perPage) - 1);

          setSelectedCard(Number(cards.at(-1).id));
        } else {
          setPage(0);
          setSelectedCard(null);
        }
      } else {
        setSelectedCard(Number(affectedCardId));
      }
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [collectionId, affectedCardId, perPage])
  );

  //   useEffect(() => {
  //     async function fetchCards() {
  //       var cards = await getCards(collectionId);
  //       setCards(cards);
  //     }
  //     fetchCards();
  //   }, [collectionId]);

  //   const pickImage = async () => {
  //     let result = await ImagePicker.launchImageLibraryAsync();

  //     // Check if the result has not been canceled and if it includes a 'uri'
  //     if (!result.canceled && result.assets && result.assets.length > 0) {
  //       setImage(result.assets[0].uri);
  //     }

  //     // if (!result.canceled) {
  //     //   setImage(result.uri);
  //     // }
  //   };

  const prevPage = () => {
    setSelectedCard(null);
    setPage(page - 1);
  };

  const nextPage = () => {
    setSelectedCard(null);
    setPage(page + 1);
  };

  const handleAddCardPress = () => {
    if (!collectionId) {
      console.error("collectionId is undefined");
      return;
    }
    console.log("handleAddCardPress");
    router.push(`/manage-collection/${collectionId}/new`);
  };

  const handleEditCardPress = () => {
    if (!collectionId) {
      console.error("collectionId is undefined");
      return;
    }
    console.log("handleEditCardPress");

    router.push(`/manage-collection/${collectionId}/${selectedCard}`);
  };

  const handleDeleteCardPress = () => {
    if (!selectedCard) return;
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the card?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            console.log("Deleting card...");
            async function onDeleteCard() {
              await deleteCard(Number(selectedCard));
              fetchCards();
              setSelectedCard(null);
            }
            onDeleteCard();
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditCollection = () => {
    if (!collectionId) {
      console.error("collectionId is undefined");
      return;
    }

    router.push(`/manage-collection/${collectionId}/edit`);
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the collection?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            console.log("Deleting collection...");
            deleteCollection(Number(collectionId));
            router.back();
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardTable}>
        <View style={styles.header}>
          <Text style={styles.headerItem}>ID</Text>
          <Text style={styles.headerItem}>Front</Text>
          <Text style={styles.headerItem}>Back</Text>
        </View>

        <FlatList
          data={cards.slice(page * perPage, (page + 1) * perPage)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedCard(item.id)}>
              <View
                style={
                  item.id !== selectedCard
                    ? [styles.row]
                    : [styles.row, styles.selectedRow]
                }
                //onTouchEnd={() => setSelectedCard(item.id)}
              >
                <Text style={styles.rowItem}>{item.id}</Text>
                <Text style={styles.rowItem} numberOfLines={1}>
                  {item.front}
                </Text>
                <Text style={styles.rowItem} numberOfLines={1}>
                  {item.back}
                </Text>
              </View>
            </Pressable>
          )}
          //style={{ flex: 1 }}
          //contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View style={styles.navBtns}>
          <Button
            title="Prev Page"
            //onPress={prevPage}
            onPress={() => (prevPageDisabled ? {} : prevPage())}
            //disabled={prevPageDisabled}
            color={
              prevPageDisabled ? styles.btnDisabled.color : styles.btn.color
            }
          />
          <View style={styles.spacer}>
            <Text> </Text>
          </View>
          <Button
            title="Next Page"
            onPress={() => (nextPageDisabled ? {} : nextPage())}
            //disabled={nextPageDisabled}
            color={
              nextPageDisabled ? styles.btnDisabled.color : styles.btn.color
            }
          />
        </View>
      </View>

      <View style={styles.cardEditBtns}>
        <View style={styles.addCardBtn}>
          <Button
            title="Add Card"
            onPress={handleAddCardPress}
            color={styles.btn.color}
          />
        </View>
        {selectedCard !== null && (
          <>
            <View style={styles.addCardBtn}>
              <Button
                title="Edit Card"
                onPress={handleEditCardPress}
                color={styles.btn.color}
              />
            </View>
            <View style={styles.deleteCardBtn}>
              <Button
                title="Delete Card"
                onPress={handleDeleteCardPress}
                color={styles.deleteCardBtn.color}
              />
            </View>
          </>
        )}
      </View>
      <View style={{ flexGrow: 1 }} />
      <View style={styles.collectionEditBtns}>
        <View style={styles.editColBtn}>
          <Button
            title="Edit Collection"
            onPress={handleEditCollection}
            color={styles.btn.color}
          />
        </View>
        <View style={styles.deleteCollectionBtn}>
          <Button
            title="Delete Collection"
            onPress={handleDeleteCollection}
            color={styles.deleteCollectionBtn.color}
          />
        </View>
      </View>
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
  cardTable: {
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
    paddingTop: 5,
  },
  btn: {
    color: "#4CAF50",
  },
  btnDisabled: {
    color: "#849184",
  },
  deleteCollectionBtn: {
    paddingTop: 5,
    color: "darkred",
  },
  cardEditBtns: { paddingTop: 5 },
  editColBtn: {
    paddingTop: 5,
  },
  collectionEditBtns: { paddingTop: 10 },
  deleteCardBtn: {
    paddingTop: 5,
    color: "darkred",
  },
});
