import { View, Text, Button } from "react-native";
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
    router.push(`/(tabs)/box/${boxId}/collections/new`);
  }

  return (
    <View>
      <Text>My Collections</Text>
      <MyCardCollections collections={collections} />
      <Button title="Add Collection" onPress={handleAddCollection}></Button>
    </View>
  );
};

export default BoxContent;
