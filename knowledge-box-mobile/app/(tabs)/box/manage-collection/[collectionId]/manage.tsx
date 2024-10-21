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

import { Collection, useCollectionModel } from "@/src/data/CollectionModel";
import { Card, useCardModel } from "@/src/data/CardModel";
import { useTheme } from "@react-navigation/native";
import { Colors } from "@/src/constants/Colors";
import { i18n } from "@/src/lib/i18n";

export default function ManageCollectionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { collectionId, affectedCardId } = useLocalSearchParams<{
    collectionId?: string;
    affectedCardId?: string;
  }>();

  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const { getCollectionById, deleteCollection } = useCollectionModel();

  const { getCards, deleteCard } = useCardModel();
  const [cards, setCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const numCards = cards.length;

  const prevPageDisabled = page === 0;
  const nextPageDisabled = numCards <= (page + 1) * perPage;

  async function fetchCards() {
    var cards = await getCards(Number(collectionId));
    setCards(cards);
    if (affectedCardId) {
      if (affectedCardId == "-1") {
        // choose last card
        if (cards.length > 0) {
          setPage(Math.ceil(cards.length / perPage) - 1);
          const lastElement = cards.at(-1);
          if (lastElement) setSelectedCard(lastElement.id);
        } else {
          setPage(0);
          setSelectedCard(null);
        }
      } else {
        setSelectedCard(Number(affectedCardId));
      }
    }
  }

  useEffect(() => {
    if (collectionId !== null)
      getCollectionById(Number(collectionId)).then((collection) =>
        setCollection(collection)
      );
  }, [collectionId]);
  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [collectionId, affectedCardId, perPage])
  );

  if (!collection) return;

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
    router.push(`/(tabs)/box/manage-collection/${collectionId}/new`);
  };

  const handleEditCardPress = () => {
    if (!collectionId) {
      console.error("collectionId is undefined");
      return;
    }
    console.log("handleEditCardPress", collectionId, selectedCard);

    router.push(
      `/(tabs)/box/manage-collection/${collectionId}/${selectedCard}`
    );
  };

  const handleDeleteCardPress = () => {
    if (!selectedCard) return;
    Alert.alert(
      i18n.t("common.confirm.deletion"),
      i18n.t("cards.confirmDeletionText"),
      [
        {
          text: i18n.t("common.cancel"),
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: i18n.t("common.delete"),
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

    router.push(`/(tabs)/box/manage-collection/${collectionId}/edit`);
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      i18n.t("common.confirm.deletion"),
      i18n.t("cards.collectionConfirmDeletionText"),
      [
        {
          text: i18n.t("common.cancel"),
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: i18n.t("common.delete"),
          onPress: () => {
            console.log("Deleting collection...");
            deleteCollection(Number(collectionId));
            router.back();
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
      <View style={styles.colNameContainer}>
        <Text style={styles.colNameTxt}>{collection.name}</Text>
      </View>
      <View style={styles.cardTable}>
        <View style={styles.header}>
          <Text style={styles.headerItem}>{i18n.t("cards.front")}</Text>
          <Text style={styles.headerItem}>{i18n.t("cards.back")}</Text>
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
          <View style={styles.navBtn}>
            {prevPageDisabled ? (
              <></>
            ) : (
              // <View style={styles.spacer}>
              //   <Text> </Text>
              // </View>

              <Button
                title="<<"
                //onPress={prevPage}
                onPress={() => (prevPageDisabled ? {} : prevPage())}
                //disabled={prevPageDisabled}
                color={colors.primary}
              />
            )}
          </View>
          <View style={styles.cardTableFootMid}>
            <Text style={styles.cardTableFootMidTxt}>
              {i18n.t("cards.numCards")}: {cards.length}
            </Text>
          </View>
          <View style={styles.navBtn}>
            {nextPageDisabled ? (
              // <View style={styles.spacer}>
              //   <Text> </Text>
              // </View>
              <></>
            ) : (
              <Button
                title=">>"
                onPress={() => (nextPageDisabled ? {} : nextPage())}
                //disabled={nextPageDisabled}
                color={colors.primary}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardEditBtns}>
        <View style={styles.addCardBtn}>
          <Button
            title={i18n.t("cards.addCard")}
            onPress={handleAddCardPress}
            color={colors.primary}
          />
        </View>
        {selectedCard !== null && (
          <>
            <View style={styles.addCardBtn}>
              <Button
                title={i18n.t("cards.editCard")}
                onPress={handleEditCardPress}
                color={colors.primary}
              />
            </View>
            <View style={styles.deleteCardBtn}>
              <Button
                title={i18n.t("cards.deleteCard")}
                onPress={handleDeleteCardPress}
                color={Colors.light.deleteBtn}
              />
            </View>
          </>
        )}
      </View>
      <View style={{ flexGrow: 1 }} />
      <View style={styles.collectionEditBtns}>
        <View style={styles.editColBtn}>
          <Button
            title={i18n.t("cards.editCollection")}
            onPress={handleEditCollection}
            color={colors.primary}
          />
        </View>
        <View style={styles.deleteCollectionBtn}>
          <Button
            title={i18n.t("cards.deleteCollection")}
            onPress={handleDeleteCollection}
            color={Colors.light.deleteBtn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1, //doesn't work - collapses the entire table
    paddingBottom: 10,
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  colNameContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#c2fbc4",
    marginBottom: 10,
  },
  colNameTxt: {
    fontWeight: "bold",
    fontSize: 24,
  },
  cardTable: {
    marginHorizontal: 30,
    //borderColor: "#000",
    //borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    backgroundColor: "#1da422",
    flexDirection: "column",
    //flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  header: {
    //flex: 1,
    flexDirection: "row",

    backgroundColor: "#1da422",
  },
  headerItem: { flex: 1, padding: 5, color: "white", fontWeight: "bold" },
  row: {
    flexDirection: "row",
    backgroundColor: "#c2fbc4",
    borderColor: "#57b75a",
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
    paddingHorizontal: 15,
  },
  navBtn: { width: 50 },
  cardTableFootMid: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTableFootMidTxt: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
  cardEditBtns: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 5,
    justifyContent: "space-evenly",
  },
  editColBtn: {
    paddingTop: 5,
  },
  collectionEditBtns: {
    paddingTop: 10,
    flexDirection: "row",
    gap: 10,

    justifyContent: "space-evenly",
  },
  deleteCardBtn: {
    paddingTop: 5,
  },
  spacer: {
    flex: 1,
  },
});
