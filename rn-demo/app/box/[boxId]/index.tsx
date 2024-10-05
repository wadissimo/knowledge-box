import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { useIsFocused } from "@react-navigation/native";

const BoxContent = () => {
  const router = useRouter();

  //const { collections } = useDatabase();
  const { fetchCollections } = useCollectionModel();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchCollections().then((res) => setCollections(res));
    }
  }, [isFocused]);

  return (
    <View>
      <Text>BoxContent</Text>
    </View>
  );
};

export default BoxContent;
