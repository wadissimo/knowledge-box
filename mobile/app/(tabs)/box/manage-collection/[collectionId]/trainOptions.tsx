import { View, Text, StyleSheet, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { i18n } from '@/src/lib/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColors } from '@/src/context/ThemeContext';
import { Collection, CollectionTrainingData, useCollectionModel } from '@/src/data/CollectionModel';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import PrimaryButton from '@/src/components/common/PrimaryButton';

const TrainOptions = () => {
  const { themeColors } = useThemeColors();
  const { collectionId } = useLocalSearchParams();
  const { getCollectionById, getCollectionTrainingData, updateCollectionTrainingData } =
    useCollectionModel();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [trainingData, setTrainingData] = useState<CollectionTrainingData | null>(null);
  const [newCardsCnt, setNewCardsCnt] = useState<string>('');
  const [reviewCardsCnt, setReviewCardsCnt] = useState<string>('');
  const [learnCardsCnt, setLearnCardsCnt] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (collectionId !== null) {
      getCollectionTrainingData(Number(collectionId)).then(trainingData => {
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
      if (newCardsCnt !== '') trainingData.maxNewCards = Number(newCardsCnt);
      if (reviewCardsCnt !== '') trainingData.maxReviewCards = Number(reviewCardsCnt);
      if (learnCardsCnt !== '') trainingData.maxLearningCards = Number(learnCardsCnt);
      updateCollectionTrainingData(trainingData).then(() => {
        router.back();
      });
    }
  }
  console.log('TrainOptions: collectionId', collectionId);
  return (
    <ScreenContainer>
      <View style={styles.formLine}>
        <Text style={[styles.label, { color: themeColors.text }]}>
          {i18n.t('collection.train.newCardsCnt')}
        </Text>

        <TextInput style={styles.input} value={newCardsCnt} onChangeText={setNewCardsCnt} />
      </View>
      <View style={styles.formLine}>
        <Text style={[styles.label, { color: themeColors.text }]}>
          {i18n.t('collection.train.reviewCardsCnt')}
        </Text>

        <TextInput style={styles.input} value={reviewCardsCnt} onChangeText={setReviewCardsCnt} />
      </View>
      <View style={styles.formLine}>
        <Text style={[styles.label, { color: themeColors.text }]}>
          {i18n.t('collection.train.learnCardsCnt')}
        </Text>

        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          value={learnCardsCnt}
          onChangeText={setLearnCardsCnt}
        />
      </View>
      <PrimaryButton text={i18n.t('common.save')} onClick={handleSave} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    //textAlign: "center",
    color: '#333',
    flex: 0.8,
  },
  multilineInput: {},
  input: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    flex: 0.2,
    margin: 5,
  },
  formLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
export default TrainOptions;
