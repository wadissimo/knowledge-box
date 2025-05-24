import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import CardComponent from '@/src/components/CardComponent';
import { Card, useCardModel } from '@/src/data/CardModel';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { Session, SessionStatus, useSessionModel } from '@/src/data/SessionModel';
import { SessionCard, useSessionCardModel } from '@/src/data/SessionCardModel';
import { useCardTrainingService } from '@/src/service/CardTrainingService';
import useDefaultTrainer from '@/src/service/trainers/DefaultTrainer';
import { Trainer } from '@/src/service/trainers/Trainer';
import { formatInterval, getTodayAsNumber, getYesterdayAsNumber } from '@/src/lib/TimeUtils';
import useMediaDataService from '@/src/service/MediaDataService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Collection, CollectionTrainingData, useCollectionModel } from '@/src/data/CollectionModel';
import TrainingResults from '@/src/components/TrainingResults';
import { i18n } from '@/src/lib/i18n';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';

const stripTimeFromDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // This will return the date in YYYY-MM-DD format
};

const NEW_CARDS_PER_DAY = 2;
const LEARNING_CARDS_PER_DAY = 50;
const REPEAT_CARDS_PER_DAY = 200;

const DEBUG = false;

const TrainCollection = () => {
  const { themeColors } = useThemeColors();
  const { collectionId } = useLocalSearchParams();

  const { learnCardLater } = useCardModel();
  const { newSession, updateSession: updateSessionDb, getStartedSession } = useSessionModel();
  const { getCurrentCards } = useCardTrainingService();
  const { playSound, getImageSource } = useMediaDataService();
  const { getCollectionById, getCollectionTrainingData, updateCollectionTrainingData } =
    useCollectionModel();
  const { deleteSessionCard } = useSessionCardModel();

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [trainingData, setTrainingData] = useState<CollectionTrainingData | null>(null);
  const [loadingTrainingData, setLoadingTrainingData] = useState(true);
  const [error, setError] = useState<string>('');

  // Load trainingData on mount or collectionId change

  // Only create trainer after trainingData is loaded
  const trainer = useDefaultTrainer(
    collectionId !== null && collectionId !== '' ? Number(collectionId) : -1,
    trainingData ? trainingData.maxNewCards : NEW_CARDS_PER_DAY,
    trainingData ? trainingData.maxReviewCards : REPEAT_CARDS_PER_DAY,
    trainingData ? trainingData.maxLearningCards : LEARNING_CARDS_PER_DAY
  );
  const trainerReady = !loadingTrainingData && collectionId !== null && collectionId !== '';

  const isFocused = useIsFocused();
  useEffect(() => {
    if (trainerReady && isFocused) {
      console.log('train.tsx: useEffect trainerReady isFocused selectNextCard start');
      selectNextCard();
      console.log('train.tsx: useEffect trainerReady isFocused selectNextCard end');
    }
  }, [session, isFocused, trainerReady]);

  useEffect(() => {
    if (trainerReady) {
      console.log('train.tsx: useEffect trainerReady updateSession start');
      updateSession();
      console.log('train.tsx: useEffect trainerReady updateSession end');
    }
  }, [trainerReady]);

  useEffect(() => {
    let isMounted = true;
    async function fetchTrainingData() {
      try {
        setLoadingTrainingData(true);
        if (collectionId) {
          const data = await getCollectionTrainingData(Number(collectionId));
          if (isMounted) setTrainingData(data);
        }
      } catch (e) {
        console.log('ERROR: train.tsx: USE EFFECT:isMounted - error', e);
        throw e;
      } finally {
        setLoadingTrainingData(false);
      }
    }
    fetchTrainingData();
    return () => {
      isMounted = false;
    };
  }, [collectionId]);

  // useEffect(() => {
  //   if (trainerReady && isFocused) {
  //     const run = async () => {
  //       try {
  //         console.log(
  //           'train.tsx: USE EFFECT: trainerReady + isFocused - starting updateSession then selectNextCard'
  //         );
  //         console.log('update Session started');
  //         await updateSession(); // make sure this is awaited
  //         console.log('update Session completed');
  //         await selectNextCard();
  //       } catch (e) {
  //         console.log('ERROR: train.tsx: USE EFFECT: trainerReady + isFocused - error', e);
  //         throw e;
  //       }
  //     };
  //     run();
  //   }
  // }, [trainerReady, isFocused]);

  const totalCards = session
    ? session.newCards + session.reviewCards + session.learningCards
    : null;
  const remainingCards = sessionCards.length;

  async function selectNextCard() {
    console.log('train.tsx: selectNextCard start');
    console.log('train.tsx: selectNextCard session', session);
    console.log('train.tsx: selectNextCard trainerReady', trainerReady);
    if (session === null || !trainerReady) {
      setCurrentCard(null);
      return;
    }

    setLoading(true);
    try {
      const card = await trainer.getNextCard(session.id);
      if (card === null) {
        await completeTraining();
      }
      setCurrentCard(card);
    } catch (e) {
      console.log('train.tsx: selectNextCard error', e);
      setError('Error in fetching next card');
    } finally {
      setLoading(false);
    }
    console.log('train.tsx: selectNextCard end');
  }

  function calcScore(session: Session) {
    const score = session.newCards * 10 + session.reviewCards * 3 + session.totalViews;
    return score;
  }
  async function completeTraining() {
    if (session === null || session.status != SessionStatus.Started) return;

    console.log('completeTraining calc stats');
    session.status = SessionStatus.Completed;
    const score = calcScore(session);
    session.score = score;
    //const trainingData = await getCollectionTrainingData(Number(collectionId));
    if (trainingData !== null) {
      const yesterday = getYesterdayAsNumber();
      if (trainingData.lastTrainingDate === yesterday) {
        trainingData.streak += 1;
      } else {
        trainingData.streak = 1;
      }
      trainingData.lastTrainingDate = getTodayAsNumber();
      trainingData.totalScore = (trainingData.totalScore ?? 0) + score;
      trainingData.totalCardViews += session.totalViews;
      trainingData.totalFailedResponses += session.failedResponses;
      trainingData.totalSuccessResponses += session.successResponses;

      await updateCollectionTrainingData(trainingData);
    }

    await updateSessionDb(session);
  }

  async function updateSession() {
    if (!collectionId || !trainerReady) return;
    try {
      setLoading(true);
      console.log('train.tsx: updateSession start');
      const curDateStripped = stripTimeFromDate(new Date());
      var session = await trainer.getSession(curDateStripped);
      var existingSession = true;

      if (session === null) {
        existingSession = false;
        console.log('train.tsx: creating session');
        session = await trainer.createSession(curDateStripped);
      }
      console.log('train.tsx: session exists');
      if (session === null) {
        console.log('Error creating session');
      }
      const sessionCards = await getCurrentCards(session.id);

      setCollection(await getCollectionById(Number(collectionId)));
      setSession(session);
      setSessionCards(sessionCards);
      console.log('train.tsx: updateSession end');
    } catch (e) {
      console.log('train.tsx: updateSession error', e);
    } finally {
      setLoading(false);
    }
  }

  const resetTraining = async () => {
    if (!trainerReady) return;
    console.log('training reset');
    const curDateStripped = stripTimeFromDate(new Date());
    var session = await getStartedSession(Number(collectionId), curDateStripped);
    if (session !== null) {
      session.status = SessionStatus.Abandoned;
      await updateSessionDb(session);
    }

    await updateSession();
  };

  async function handleUserResponse(userResponse: 'again' | 'hard' | 'good' | 'easy') {
    if (session === null || currentCard === null || !trainerReady) return;
    console.log('user response', userResponse);
    //increase view count
    session.totalViews += 1;
    switch (userResponse) {
      case 'again':
        session.failedResponses += 1;
        break;
      case 'good':
      case 'easy':
        session.successResponses += 1;
        break;
    }
    await updateSessionDb(session);

    await trainer.processUserResponse(session.id, currentCard, userResponse, sessionCards);

    const newSessionCards = await getCurrentCards(session.id);
    setSessionCards(newSessionCards);
    await selectNextCard();
  }

  function handleEditMenu() {
    console.log('handleEditMenu');
    if (currentCard !== null) router.push(`./${currentCard.id}`);
  }

  async function handlePostponeMenu() {
    if (currentCard !== null && session !== null) {
      console.log('deleting session card', session.id, currentCard.id);
      await learnCardLater(currentCard);
      await deleteSessionCard(session.id, currentCard.id);
      const newSessionCards = await getCurrentCards(session.id);
      setSessionCards(newSessionCards);
      await selectNextCard();
    }
  }
  function handleTooEasyMenu() {
    handleUserResponse('easy');
  }
  console.log(
    'train.tsx: loading',
    loading,
    'loadingTrainingData',
    loadingTrainingData,
    'session',
    session,
    'currentCard',
    currentCard
  );
  if (loading || loadingTrainingData) return null;
  if (session === null) return null;

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
        {currentCard ? (
          <CardComponent
            currentCard={currentCard}
            onUserResponse={handleUserResponse}
            cardDimensions={{ height: 500, width: 300 }}
            playSound={playSound}
            getImageSource={getImageSource}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 0.9 }}>
              <TrainingResults session={session} onResetTraining={resetTraining} />
            </View>
            <View>
              <Button
                title={i18n.t('common.navBack')}
                onPress={() => router.back()}
                color={themeColors.primaryBtnBg}
              />
            </View>
          </View>
        )}
        {DEBUG && (
          <>
            <ScrollView style={styles.scrollView}>
              {sessionCards.map((card: Card) => {
                return (
                  <View style={{ flexDirection: 'row', gap: 1 }} key={`card-${card.id}`}>
                    <View style={{ flex: 1 }}>
                      <Text>{card?.front}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text>{card?.status}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text>{card?.repeatTime}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text>{formatInterval(card?.interval ?? 0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text>{card?.easeFactor?.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View>
              <Button title="Reset Training" onPress={resetTraining} />
            </View>
          </>
        )}
      </ScreenContainer>
    </View>
  );
};

const CardMenu = ({
  onEdit,
  onPostpone,
  onMarkEasy,
}: {
  onEdit: Function;
  onPostpone: Function;
  onMarkEasy: Function;
}) => {
  const { themeColors } = useThemeColors();

  return (
    <Menu>
      <MenuTrigger>
        <Icon
          name="dots-vertical"
          color={themeColors.subHeaderText}
          size={32}
          style={styles.topPanelMenuIcon}
        />
      </MenuTrigger>
      <MenuOptions customStyles={{ optionWrapper: { backgroundColor: themeColors.popupBg } }}>
        <MenuOption onSelect={() => onEdit()}>
          <Text>{i18n.t('cards.popupMenu.editCard')}</Text>
        </MenuOption>

        <MenuOption onSelect={() => onPostpone()}>
          <Text>{i18n.t('cards.popupMenu.postpone')}</Text>
        </MenuOption>
        <MenuOption onSelect={() => onMarkEasy()}>
          <Text>{i18n.t('cards.popupMenu.tooEasy')}</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'lightgrey',
    marginHorizontal: 20,
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
