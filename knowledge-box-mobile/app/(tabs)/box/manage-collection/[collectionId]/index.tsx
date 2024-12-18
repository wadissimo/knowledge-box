import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Button } from "react-native";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import {
  Collection,
  CollectionTrainingData,
  useCollectionModel,
} from "@/src/data/CollectionModel";
import { i18n } from "@/src/lib/i18n";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { CardStatus, useCardModel } from "@/src/data/CardModel";

const CollectionView = () => {
  const { colors } = useAppTheme();
  const { collectionId } = useLocalSearchParams();
  const { getCollectionById, getCollectionTrainingData } = useCollectionModel();
  const { getCardCountByStatus } = useCardModel();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [trainingData, setTrainingData] =
    useState<CollectionTrainingData | null>(null);
  const [newCardCount, setNewCardCount] = useState<number>(0);
  const [reviewCardCount, setReviewCardCount] = useState<number>(0);
  const [learningCardCount, setLearningCardCount] = useState<number>(0);

  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (collectionId && isFocused) {
      const colId = Number(collectionId);
      Promise.all([
        getCollectionById(colId),
        getCollectionTrainingData(colId),
        getCardCountByStatus(colId, CardStatus.New),
        getCardCountByStatus(colId, CardStatus.Review),
        getCardCountByStatus(colId, CardStatus.Learning),
      ]).then(([col, data, newCount, reviewCount, learningCount]) => {
        setCollection(col);
        setTrainingData(data);
        setNewCardCount(newCount);
        setReviewCardCount(reviewCount);
        setLearningCardCount(learningCount);
      });
      //getCollectionById(Number(collectionId)).then((col) => setCollection(col));
    }
  }, [collectionId, isFocused]);

  function handleManageCollectionPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/manage`);
  }
  function handleTrainPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/train`);
  }
  function handleTrainOptions() {
    router.push("./trainOptions");
  }

  if (collection === null) return null;
  return (
    <View style={styles.container}>
      <View style={[styles.colNameContainer, { backgroundColor: colors.card }]}>
        <Text style={styles.colNameTxt}>{collection.name}</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={[styles.stats, { backgroundColor: colors.card }]}>
          <Text style={styles.statsHeaderTxt}>
            {i18n.t("collection.train.stats")}
          </Text>

          <Text style={styles.statsTxt}>
            {i18n.t("collection.train.cardViews")}{" "}
            {trainingData?.totalCardViews ?? 0}
          </Text>

          <Text style={styles.statsTxt}>
            {i18n.t("collection.stats.newCards")} {newCardCount}
          </Text>
          <Text style={styles.statsTxt}>
            {i18n.t("collection.stats.reviewCards")}{" "}
            {reviewCardCount + learningCardCount}
          </Text>

          <Text style={styles.statsTxt}>
            {i18n.t("collection.train.score")} {trainingData?.totalScore ?? 0}
          </Text>
          <Text style={styles.statsTxt}>
            {i18n.t("collection.train.streak")} {trainingData?.streak ?? 0}
          </Text>
        </View>
      </View>
      <View style={styles.trainOptBtnContainer}>
        <Button
          title={i18n.t("collection.train.options")}
          color={colors.primary}
          onPress={handleTrainOptions}
        />
      </View>
      <View style={styles.trainBtnContainer}>
        <Button
          title={i18n.t("collection.train.trainBtn")}
          color={colors.primary}
          onPress={handleTrainPress}
        />
      </View>

      {/* <View style={styles.mngBtnContainer}>
        <Button
          title={i18n.t("cards.manageCollection")}
          color={colors.primary}
          onPress={handleManageCollectionPress}
        />
      </View> */}
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
  },
  colNameTxt: {
    fontWeight: "bold",
    fontSize: 24,
  },
  trainOptBtnContainer: {
    justifyContent: "center",
    margin: 5,
    height: 80,
  },
  trainBtnContainer: {
    justifyContent: "center",
    margin: 5,
    height: 80,
  },
  mngBtnContainer: {
    margin: 5,
  },
  statsContainer: {
    flex: 0.7,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
    // backgroundColor: "orange",
  },
  stats: {
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
  },
  statsHeaderTxt: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statsTxt: {
    fontSize: 18,
    margin: 5,
  },
});

export default CollectionView;
