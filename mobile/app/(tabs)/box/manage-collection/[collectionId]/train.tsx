import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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
import { useTrainingFlow } from '@/src/service/TrainingFlow';

const TrainCollection = () => {
  const { themeColors } = useThemeColors();
  const { collectionId } = useLocalSearchParams();
  const { playSound, getImageSource } = useMediaDataService();
  const [remainingCards, setRemainingCards] = useState(0);

  const router = useRouter();

  const {
    trainingData,
    isLoaded,
    error,
    collection,
    session,
    currentCard,
    onUserResponse,
    onResetTraining,
  } = useTrainingFlow(collectionId !== null && collectionId !== '' ? Number(collectionId) : null);

  const totalCards = session
    ? session.newCards + session.reviewCards + session.learningCards
    : null;

  function calcScore(session: Session) {
    const score = session.newCards * 10 + session.reviewCards * 3 + session.totalViews;
    return score;
  }

  async function handleUserResponse(userResponse: 'again' | 'hard' | 'good' | 'easy') {
    if (session === null || currentCard === null) return;
    console.log('user response', userResponse);
    onUserResponse(userResponse);
  }

  function handleEditMenu() {
    console.log('handleEditMenu');
    if (currentCard !== null) router.push(`./${currentCard.id}`);
  }

  async function handlePostponeMenu() {
    if (currentCard !== null && session !== null) {
      console.log('deleting session card', session.id, currentCard.id);
      // await learnCardLater(currentCard);
      // await deleteSessionCard(session.id, currentCard.id);
      // const newSessionCards = await getCurrentCards(session.id);
      // setSessionCards(newSessionCards);
      // await selectNextCard();
    }
  }

  function handleTooEasyMenu() {
    handleUserResponse('easy');
  }
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

  console.log('currentCard', currentCard);

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
            <TrainingResults session={session!} onResetTraining={onResetTraining} />
          </View>
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
