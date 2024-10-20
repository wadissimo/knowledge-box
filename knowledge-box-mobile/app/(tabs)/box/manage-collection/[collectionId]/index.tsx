import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Button } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { i18n } from "@/lib/i18n";

const CollectionView = () => {
  const { colors } = useTheme();
  const { collectionId } = useLocalSearchParams();
  const { getCollectionById } = useCollectionModel();
  const [collection, setCollection] = useState<Collection | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
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
        <Text>{i18n.t("cards.train.stats")}:</Text>
        <Button
          title={i18n.t("cards.train.trainBtn")}
          color={colors.primary}
          onPress={handleTrainPress}
        />
      </View>

      <View style={styles.mngBtnContainer}>
        <Button
          title={i18n.t("cards.manageCollection")}
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
