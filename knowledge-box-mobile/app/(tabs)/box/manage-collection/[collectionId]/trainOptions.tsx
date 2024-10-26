import { View, Text, StyleSheet, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { Button } from "react-native";
import { i18n } from "@/src/lib/i18n";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Collection,
  CollectionTrainingData,
  useCollectionModel,
} from "@/src/data/CollectionModel";

const TrainOptions = () => {
  const { colors } = useAppTheme();
  const { collectionId } = useLocalSearchParams();
  const {
    getCollectionById,
    getCollectionTrainingData,
    updateCollectionTrainingData,
  } = useCollectionModel();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [trainingData, setTrainingData] =
    useState<CollectionTrainingData | null>(null);
  const [newCardsCnt, setNewCardsCnt] = useState<string>("");
  const [reviewCardsCnt, setReviewCardsCnt] = useState<string>("");
  const [learnCardsCnt, setLearnCardsCnt] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (collectionId !== null) {
      getCollectionTrainingData(Number(collectionId)).then((trainingData) => {
        setTrainingData(trainingData);
        if (trainingData !== null) {
          setNewCardsCnt(trainingData?.maxNewCards.toString());
          setReviewCardsCnt(trainingData?.maxReviewCards.toString());
          setLearnCardsCnt(trainingData?.maxLearningCards.toString());
        }
      });
    }
  }, [collectionId]);
  function handleSave() {
    if (trainingData !== null) {
      if (newCardsCnt !== "") trainingData.maxNewCards = Number(newCardsCnt);
      if (reviewCardsCnt !== "")
        trainingData.maxReviewCards = Number(reviewCardsCnt);
      if (learnCardsCnt !== "")
        trainingData.maxLearningCards = Number(learnCardsCnt);
      updateCollectionTrainingData(trainingData).then(() => {
        router.back();
      });
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.formLine}>
        <Text style={styles.label}>
          {i18n.t("collection.train.newCardsCnt")}
        </Text>

        <TextInput
          style={styles.input}
          value={newCardsCnt}
          onChangeText={setNewCardsCnt}
        />
      </View>
      <View style={styles.formLine}>
        <Text style={styles.label}>
          {i18n.t("collection.train.reviewCardsCnt")}
        </Text>

        <TextInput
          style={styles.input}
          value={reviewCardsCnt}
          onChangeText={setReviewCardsCnt}
        />
      </View>
      <View style={styles.formLine}>
        <Text style={styles.label}>
          {i18n.t("collection.train.learnCardsCnt")}
        </Text>

        <TextInput
          style={styles.input}
          value={learnCardsCnt}
          onChangeText={setLearnCardsCnt}
        />
      </View>

      <Button
        title={i18n.t("common.save")}
        onPress={handleSave}
        color={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
    //textAlign: "center",
    color: "#333",
    flex: 0.8,
  },
  multilineInput: {},
  input: {
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
    flex: 0.2,
    margin: 5,
  },
  formLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});
export default TrainOptions;
