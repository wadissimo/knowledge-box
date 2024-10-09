import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Button } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Collection, useCollectionModel } from "@/data/CollectionModel";

const CollectionView = () => {
  const { colors } = useTheme();
  const { collectionId } = useLocalSearchParams();
  const { getCollectionById } = useCollectionModel();
  const [collection, setCollection] = useState<Collection | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (collectionId) {
      getCollectionById(Number(collectionId)).then((col) => setCollection(col));
    }
  }, [collectionId]);

  function handleManageCollectionPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/manage`);
  }
  function handleTrainPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/train`);
  }
  if (collection === null) return null;
  return (
    <View style={styles.container}>
      <View style={styles.colNameContainer}>
        <Text style={styles.colNameTxt}>{collection.name}</Text>
      </View>
      <View style={styles.trainBtnContainer}>
        <Text>Train Stats</Text>
        <Button
          title="Train"
          color={colors.primary}
          onPress={handleTrainPress}
        />
      </View>
      <View style={styles.mngBtnContainer}>
        <Button
          title="Manage Collection"
          color={colors.primary}
          onPress={handleManageCollectionPress}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  colNameContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#c2fbc4",
  },
  colNameTxt: {
    fontWeight: "bold",
    fontSize: 24,
  },
  trainBtnContainer: {
    flex: 1,
    justifyContent: "center",
    margin: 5,
  },
  mngBtnContainer: {
    margin: 5,
  },
});

export default CollectionView;
