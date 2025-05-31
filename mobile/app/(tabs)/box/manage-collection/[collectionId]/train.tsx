import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import CardComponent from '@/src/components/box/train/CardComponent';
import { useCardTrainingService } from '@/src/service/CardTrainingService';
import useMediaDataService from '@/src/service/MediaDataService';

import TrainingResults from '@/src/components/TrainingResults';
import { i18n } from '@/src/lib/i18n';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { useTrainingFlow } from '@/src/service/TrainingFlow';
import CardMenu from '@/src/components/box/train/CardMenu';

const TrainCollection = () => {
  const { themeColors } = useThemeColors();
  const { collectionId } = useLocalSearchParams();
  const { playSound, getImageSource } = useMediaDataService();
  const [remainingCards, setRemainingCards] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const { getCurrentCardsCount, getSessionCardsCount } = useCardTrainingService();

  const router = useRouter();

  const {
    isLoaded,
    error,
    collection,
    session,
    currentCard,
    onUserResponse,
    onResetTraining,
    onPostpone,
  } = useTrainingFlow(collectionId !== null && collectionId !== '' ? Number(collectionId) : null);

  useEffect(() => {
    const run = async () => {
      if (session !== null) {
        setRemainingCards(await getCurrentCardsCount(session.id));
        setTotalCards(await getSessionCardsCount(session.id));
      }
    };
    run();
  }, [session]);

  useEffect(() => {
    const run = async () => {
      if (session !== null && isLoaded && currentCard == null) {
        console.log('train.tsx training complete. redirect to results', session.id);
        router.replace(`./trainingResults/${session.id}`);
      }
    };
    run();
  }, [currentCard, isLoaded]);

  async function handleUserResponse(userResponse: 'again' | 'hard' | 'good' | 'easy') {
    if (session === null || currentCard === null) return;
    console.log('user response', userResponse);
    await onUserResponse(userResponse);
    setRemainingCards(await getCurrentCardsCount(session.id));
    setTotalCards(await getSessionCardsCount(session.id));
  }

  function handleEditMenu() {
    console.log('handleEditMenu');
    if (currentCard !== null) router.push(`./${currentCard.id}`);
  }

  async function handlePostponeMenu() {
    if (currentCard !== null && session !== null) {
      console.log('deleting session card', session.id, currentCard.id);
      await onPostpone();
      setRemainingCards(await getCurrentCardsCount(session.id));
      setTotalCards(await getSessionCardsCount(session.id));
    }
  }

  function handleTooEasyMenu() {
    handleUserResponse('easy');
  }

  // async function handleTrainingReset() {
  //   await onResetTraining();
  //   if (session !== null) {
  //     setRemainingCards(await getCurrentCardsCount(session.id));
  //     setTotalCards(await getSessionCardsCount(session.id));
  //   }
  // }
  console.log('train.tsx re-rendered, isLoaded: ' + isLoaded, 'currentCard', currentCard?.front);
  if (error)
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
        <Button title="Reload" onPress={() => router.reload()} />
      </View>
    );
  if (!isLoaded)
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );

  if (session !== null) {
    console.log('session Id', session.id);
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.topPanel, { backgroundColor: themeColors.subHeaderBg }]}>
        <Text style={[styles.topPanelTxt, { color: themeColors.subHeaderText }]}>
          {collection ? collection.name : ''}
        </Text>
        <Text style={[{ color: themeColors.subHeaderText }]}>
          {totalCards !== null ? `${remainingCards} / ${totalCards}` : ''}
        </Text>
        {currentCard && (
          <CardMenu
            onEdit={handleEditMenu}
            onPostpone={handlePostponeMenu}
            onMarkEasy={handleTooEasyMenu}
          />
        )}
      </View>
      <ScreenContainer>
        {currentCard && (
          <CardComponent
            //key={currentCard.id}
            currentCard={currentCard}
            onUserResponse={handleUserResponse}
            cardDimensions={{ height: 500, width: 300 }}
            playSound={playSound}
            getImageSource={getImageSource}
          />
        )}
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  noMoreCardsTextView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreCardsText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 40,
  },
  scoreText: {
    fontSize: 20,

    paddingBottom: 40,
  },
  topPanel: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
    paddingLeft: 10,
    //backgroundColor: "white",
  },
  topPanelTxt: {
    fontSize: 16,
    flex: 1,
  },
  topPanelMenuIcon: {
    marginLeft: 10,
  },
});
export default TrainCollection;
