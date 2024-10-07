import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ServerCollection } from "../addCollection";
import { useTheme } from "@react-navigation/native";
import { Button } from "react-native";
import { useCollectionModel } from "@/data/CollectionModel";
import { useCardModel } from "@/data/CardModel";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";

export type ServerCard = {
  id: number;
  collectionId: number;
  front: string;
  back: string;
  createdAt: string | null;
  easeFactor: number;
};

const CollectionPreview = () => {
  const { colors } = useTheme();
  const { boxId, previewColId } = useLocalSearchParams();
  const [collection, setCollection] = useState<ServerCollection | null>(null);
  const [cards, setCards] = useState<ServerCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { newCollection } = useCollectionModel();
  const { newBoxCollection } = useBoxCollectionModel();
  const { newCards } = useCardModel();
  const router = useRouter();

  useEffect(() => {
    const URL =
      process.env.EXPO_PUBLIC_API_URL +
      "collections/preview/" +
      Number(previewColId);

    setLoading(true);

    fetch(URL)
      .then((data) => data.json())
      .then((r) => onLoad(r))
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  function onLoad(res: any) {
    setLoading(false);
    if (res && res.collection && res.cards) {
      setCollection(res.collection);
      setCards(res.cards);
    }
  }

  function handleAddCollection() {
    const URL =
      process.env.EXPO_PUBLIC_API_URL +
      "collections/download/" +
      Number(previewColId);

    setLoading(true);

    fetch(URL)
      .then((data) => data.json())
      .then((r) => onDownload(r))
      .then(() => setLoading(false))
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }

  async function onDownload(res: any) {
    if (res && res.collection && res.cards) {
      const collection = res.collection;
      //const cards = res.cards;
      //console.log("collection:", collection);
      //console.log("cards:", cards[0]);
      const newColId = await newCollection(collection.name);
      await newBoxCollection(Number(boxId), newColId);
      await newCards(
        (res.cards as ServerCard[]).map((card) => ({
          collectionId: newColId,
          front: card.front,
          back: card.back,
        }))
      );
      router.back();
      router.back();
    }
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
