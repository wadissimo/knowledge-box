import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useTheme } from "@react-navigation/native";
import { Button } from "react-native";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { Card, useCardModel } from "@/data/CardModel";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import useSyncService from "@/service/CollectionRemoteService";

const CollectionPreview = () => {
  const { colors } = useTheme();
  const { boxId, previewColId } = useLocalSearchParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  const router = useRouter();
  const { error, loading, getCollectionPreview, addCollection } =
    useSyncService();

  useEffect(() => {
    getCollectionPreview(Number(previewColId)).then((res) => {
      if (res !== null) {
        setCollection(res.collection);
        setCards(res.cards);
      }
    });
  }, []);

  function handleAddCollection() {
    // Add collection and all it's cards and get back to the Box screen
    addCollection(Number(boxId), Number(previewColId)).then(() => {
      if (error) {
        // TODO: Error should be shown on UI
        console.log("Add Collection Failed");
      } else {
        router.back();
        router.back();
      }
    });
  }

  if (!collection) return null;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.sectionHeaderText}>Collection:</Text>
      </View>
      <View style={[styles.collectionBox, styles.elevation, styles.shadowProp]}>
        <Text style={styles.collectionNameTxt}>{collection.name}</Text>
        <Text style={styles.collectionDescrTxt}>{collection.description}</Text>
        <Text>Cards: {collection.cardsNumber}</Text>
      </View>
      <View>
        <Text style={styles.sectionHeaderText}>Cards Sample:</Text>
      </View>
      <View style={styles.cardPreviewList}>
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          data={cards}
          renderItem={({ item }) => (
            <View
              style={styles.row}
              //onTouchEnd={() => setSelectedCard(item.id)}
            >
              {/* <Text style={styles.rowItem}>{item.id}</Text> */}
              <Text style={styles.rowItem} numberOfLines={1}>
                {item.front}
              </Text>
              <Text style={styles.rowItem} numberOfLines={1}>
                {item.back}
              </Text>
            </View>
          )}
        />
      </View>
      <Button
        title="Add Collection"
        onPress={handleAddCollection}
        color={colors.primary}
      ></Button>
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

  collectionBox: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    backgroundColor: "#c2fbc4",
    margin: 5,
  },
  collectionNameTxt: {
    fontSize: 18,
    fontWeight: "bold",
  },
  collectionDescrTxt: {
    fontSize: 14,
  },

  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 5,
    shadowColor: "#52006A",
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#c2fbc4",
    borderColor: "lightgrey",
    borderWidth: 1,
  },
  selectedRow: {
    borderColor: "orange",
    borderWidth: 1,
  },
  rowItem: { flex: 1, padding: 5 },
  cardPreviewList: {
    flex: 1,
  },
});

export default CollectionPreview;
