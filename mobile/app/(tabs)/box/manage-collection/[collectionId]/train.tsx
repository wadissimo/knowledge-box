import { View, Text, Button, StyleSheet, ActivityIndicator, Modal, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import CardComponent from '@/src/components/box/train/CardComponent';
import { useCardTrainingService } from '@/src/service/CardTrainingService';
import useMediaDataService from '@/src/service/MediaDataService';

import { i18n } from '@/src/lib/i18n';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { useTrainingFlow } from '@/src/service/TrainingFlow';
import CardMenu from '@/src/components/box/train/CardMenu';
import { SETTING_IDS, useSettingsModel } from '@/src/data/SettingsModel';
import PrimaryButton from '@/src/components/common/PrimaryButton';
import { ReviewLog, useReviewLogModel } from '@/src/data/ReviewLogModel';

const TrainCollection = () => {
  const { themeColors } = useThemeColors();
  const { collectionId } = useLocalSearchParams();
  //State
  const [remainingCards, setRemainingCards] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);

  const { playSound, getImageSource } = useMediaDataService();
  const { getCurrentCardsCount, getSessionCardsCount } = useCardTrainingService();
  const [audioAutoplay, setAudioAutoplay] = useState(false);
  const router = useRouter();
  const { getSettingById } = useSettingsModel();
  const { getReviewLog } = useReviewLogModel();

  const {
    isLoaded,
    error,
    collection,
    session,
    currentCard,
    onUserResponse,
    onPostpone,
    preprocessUserResponse,
    isRollbackPossible,
    rollbackToPrevCard,
    cardsToLearn,
    cardsToReview,
    cardsNew,
    currentPool,
  } = useTrainingFlow(
    collectionId !== null && collectionId !== '' ? Number(collectionId) : null,
    async () => {
      await onTrainingCompleted();
    }
  );

  const onTrainingCompleted = async () => {
    if (session === null) {
      console.error('train.tsx: onTrainingCompleted: session is null');
      return;
    }
    router.replace(`./trainingResults/${session.id}`);
  };

  // Effects
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
      // console.debug('train.tsx useEffect currentCard', currentCard?.front);
      if (session !== null && isLoaded && currentCard == null) {
        // console.log('train.tsx training complete. redirect to results', session.id);
        router.replace(`./trainingResults/${session.id}`);
      }
      const audioAutoplaySetting = await getSettingById(SETTING_IDS.audioAutoplay);
      if (audioAutoplaySetting) {
        setAudioAutoplay(audioAutoplaySetting.value === 'true');
      }
      if (currentCard !== null) {
        const reviewLogs = await getReviewLog(currentCard.id);
        setReviewLogs(reviewLogs);
      }
    };
    run();
  }, [currentCard, isLoaded]);

  // console.debug('train.tsx re-rendered, isLoaded: ' + isLoaded, 'currentCard', currentCard?.front);

  // Functions
  async function handleUserResponse(userResponse: 'again' | 'hard' | 'good' | 'easy') {
    if (session === null || currentCard === null) return;
    // console.log('user response', userResponse);
    await onUserResponse(userResponse);
    setRemainingCards(await getCurrentCardsCount(session.id));
    setTotalCards(await getSessionCardsCount(session.id));
  }

  function handleEditMenu() {
    // console.log('handleEditMenu');
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
  async function handleLogModalOpen() {
    setLogModalVisible(true);
  }
  async function handleLogModalClose() {
    // console.log('close log modal');
    setLogModalVisible(false);
  }

  console.log(
    'train.tsx re-rendered, isLoaded: ' + isLoaded,
    'currentCard',
    currentCard?.front,
    'currentPool',
    currentPool
  );
  // console.log(
  //   'train.tsx review Cards: ' +
  //     cardsToReview?.map(c => `${c.front} ${c.repeatTime !== null ? new Date(c.repeatTime) : ''}`)
  // );
  // console.log(
  //   'train.tsx learn Cards: ' +
  //     cardsToLearn?.map(c => `${c.front} ${c.repeatTime !== null ? new Date(c.repeatTime) : ''}`)
  // );
  // console.log(
  //   'train.tsx new Cards: ' +
  //     cardsNew?.map(c => `${c.front} ${c.repeatTime !== null ? new Date(c.repeatTime) : ''}`)
  // );
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

        {totalCards !== null && (
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={[
                { color: themeColors.subHeaderText },
                currentPool === 'new' ? { textDecorationLine: 'underline' } : {},
              ]}
            >
              {cardsNew !== null ? cardsNew.length : 0}
            </Text>
            <Text style={{ color: themeColors.subHeaderText }}> / </Text>
            <Text
              style={[
                { color: themeColors.subHeaderText },
                currentPool === 'learn' ? { textDecorationLine: 'underline' } : {},
              ]}
            >
              {cardsToLearn !== null ? cardsToLearn.length : 0}
            </Text>
            <Text style={{ color: themeColors.subHeaderText }}> / </Text>
            <Text
              style={[
                { color: themeColors.subHeaderText },
                currentPool === 'review' ? { textDecorationLine: 'underline' } : {},
              ]}
            >
              {cardsToReview !== null ? cardsToReview.length : 0}
            </Text>
            <Text style={[{ color: themeColors.subHeaderText }]}> ({totalCards})</Text>
          </View>
        )}

        {currentCard && (
          <CardMenu
            onEdit={handleEditMenu}
            onPostpone={handlePostponeMenu}
            isRollbackPossible={isRollbackPossible}
            rollbackToPrevCard={rollbackToPrevCard}
            handleLogModalOpen={handleLogModalOpen}
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
            audioAutoplay={audioAutoplay}
            getImageSource={getImageSource}
            preprocessUserResponse={preprocessUserResponse}
          />
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={logModalVisible}
          onRequestClose={handleLogModalClose}
          onDismiss={handleLogModalClose}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          >
            <View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 18, padding: 20 }}>
              <Text>Logs</Text>
              <FlatList data={reviewLogs} renderItem={({ item }) => <Text>{item.grade}</Text>} />
              <PrimaryButton text={i18n.t('common.back') || 'Back'} onClick={handleLogModalClose} />
            </View>
          </View>
        </Modal>
        <View>
          <Text>{`Pool: ${currentPool} card status: ${currentCard?.status}`}</Text>
        </View>
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
