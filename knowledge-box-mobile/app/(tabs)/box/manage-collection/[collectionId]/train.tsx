import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import CardComponent from "@/src/components/CardComponent";
import { Card, useCardModel } from "@/src/data/CardModel";
import { useIsFocused, useTheme } from "@react-navigation/native";
import {
  Session,
  SessionStatus,
  useSessionModel,
} from "@/src/data/SessionModel";
import { SessionCard, useSessionCardModel } from "@/src/data/SessionCardModel";
import { useCardTrainingService } from "@/src/service/CardTrainingService";
import useDefaultTrainer from "@/src/service/trainers/DefaultTrainer";
import { Trainer } from "@/src/service/trainers/Trainer";
import {
  formatInterval,
  getTodayAsNumber,
  getYesterdayAsNumber,
} from "@/src/lib/TimeUtils";
import useMediaDataService from "@/src/service/MediaDataService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Collection, useCollectionModel } from "@/src/data/CollectionModel";
import TrainingResults from "@/src/components/TrainingResults";
import { i18n } from "@/src/lib/i18n";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { useAppTheme } from "@/src/hooks/useAppTheme";

const stripTimeFromDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // This will return the date in YYYY-MM-DD format
};

const NEW_CARDS_PER_DAY = 2;
const LEARNING_CARDS_PER_DAY = 50;
const REPEAT_CARDS_PER_DAY = 200;

const DEBUG = false;

const TrainCollection = () => {
  const { colors } = useAppTheme();
  const { collectionId } = useLocalSearchParams();

  const trainer: Trainer = useDefaultTrainer(
    collectionId !== null && collectionId !== "" ? Number(collectionId) : -1,
    NEW_CARDS_PER_DAY,
    REPEAT_CARDS_PER_DAY,
    LEARNING_CARDS_PER_DAY
  );

  const { learnCardLater } = useCardModel();
  const { updateSession: updateSessionDb, getStartedSession } =
    useSessionModel();
  const { getCurrentCards } = useCardTrainingService();
  const { playSound, getImageSource } = useMediaDataService();
  const {
    getCollectionById,
    getCollectionTrainingData,
    updateCollectionTrainingData,
  } = useCollectionModel();
  const { deleteSessionCard } = useSessionCardModel();

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [error, setError] = useState<string>("");
  const isFocused = useIsFocused();
  const totalCards = session
    ? session.newCards + session.reviewCards + session.learningCards
    : null;
  const remainingCards = sessionCards.length;

  function selectNextCard() {
    if (session === null) {
      setCurrentCard(null);
      return;
    }

    setLoading(true);
    trainer
      .getNextCard(session.id)
      .then((card) => {
        console.log("curent card", card);
        if (card === null) {
          completeTraining()
            .then(() => {
              setCurrentCard(null);
              setLoading(false);
            })
            .catch((e) => {
              setError("Error in completing training"); // todo:
              console.error("Error in completing training", e);
              setLoading(false);
            });
        } else {
          setCurrentCard(card);
          setLoading(false);
        }
      })
      .catch((e) => {
        setError("Error in fetching next card");
        console.error("Error in fetching next card", e);
        setLoading(false);
      });
  }

  function calcScore(session: Session) {
    const score =
      session.newCards * 10 + session.reviewCards * 3 + session.totalViews;
    return score;
  }
  async function completeTraining() {
    if (session === null || session.status != SessionStatus.Started) return;

    console.log("completeTraining calc stats");
    session.status = SessionStatus.Completed;
    const score = calcScore(session);
    session.score = score;
    const trainingData = await getCollectionTrainingData(Number(collectionId));
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
    console.log("updateSession");
    if (!collectionId) return;
    const curDateStripped = stripTimeFromDate(new Date());

    var session = await trainer.getSession(curDateStripped);
    var existingSession = true;
    if (session === null) {
      console.log("Creating a training session");
      existingSession = false;
      session = await trainer.createSession(curDateStripped);
    }
    const sessionCards = await getCurrentCards(session.id);

    setCollection(await getCollectionById(Number(collectionId)));
    setSession(session);
    setSessionCards(sessionCards);
    setLoading(true);
  }

  useEffect(() => {
    updateSession();
  }, [collectionId]);

  useEffect(() => {
    if (isFocused) selectNextCard();
  }, [session, isFocused]);

  const resetTraining = async () => {
    console.log("training reset");
    const curDateStripped = stripTimeFromDate(new Date());
    var session = await getStartedSession(
      Number(collectionId),
      curDateStripped
    );
    if (session !== null) {
      session.status = SessionStatus.Abandoned;
      await updateSessionDb(session);
    }

    await updateSession();
  };

  async function handleUserResponse(
    userResponse: "again" | "hard" | "good" | "easy"
  ) {
    if (session === null || currentCard === null) return;
    //increase view count
    session.totalViews += 1;
    switch (userResponse) {
      case "again":
        session.failedResponses += 1;
        break;
      case "good":
      case "easy":
        session.successResponses += 1;
        break;
    }
    await updateSessionDb(session);

    await trainer.processUserResponse(
      session.id,
      currentCard,
      userResponse,
      sessionCards
    );

    const newSessionCards = await getCurrentCards(session.id);
    setSessionCards(newSessionCards);
    selectNextCard();
  }

  function handleEditMenu() {
    if (currentCard !== null) router.push(`./${currentCard.id}`);
  }

  function handlePostponeMenu() {
    if (currentCard !== null && session !== null)
      Promise.all([
        learnCardLater(currentCard),
        deleteSessionCard(session.id, currentCard.id),
      ]).then(() => {
        selectNextCard();
      });
  }
  function handleTooEasyMenu() {
    handleUserResponse("easy");
  }
  if (loading) return null;
  if (session === null) return null;
  return (
    <View style={styles.container}>
      <View style={[styles.topPanel, { backgroundColor: colors.card }]}>
        <Text style={styles.topPanelTxt}>
          {collection ? collection.name : ""}
        </Text>
        <Text>
          {totalCards !== null ? `${remainingCards} / ${totalCards}` : ""}
        </Text>
        {currentCard && (
          <CardMenu
            onEdit={handleEditMenu}
            onPostpone={handlePostponeMenu}
            onMarkEasy={handleTooEasyMenu}
          />
        )}
      </View>
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
            <TrainingResults
              session={session}
              onResetTraining={resetTraining}
            />
          </View>
          <View>
            <Button
              title={i18n.t("common.navBack")}
              onPress={() => router.back()}
              color={colors.primary}
            />
          </View>
        </View>
      )}
      {DEBUG && (
        <>
          <ScrollView style={styles.scrollView}>
            {sessionCards.map((card: Card) => {
              return (
                <View
                  style={{ flexDirection: "row", gap: 1 }}
                  key={`card-${card.id}`}
                >
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
  const { colors } = useAppTheme();

  return (
    <Menu>
      <MenuTrigger>
        <Icon
          name="dots-vertical"
          color={"black"}
          size={32}
          style={styles.topPanelMenuIcon}
        />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption
          style={{ backgroundColor: colors.popup }}
          onSelect={() => onEdit()}
        >
          <Text>{i18n.t("cards.popupMenu.editCard")}</Text>
        </MenuOption>

        <MenuOption
          style={{ backgroundColor: colors.popup }}
          onSelect={() => onPostpone()}
        >
          <Text>{i18n.t("cards.popupMenu.postpone")}</Text>
        </MenuOption>
        <MenuOption
          style={{ backgroundColor: colors.popup }}
          onSelect={() => onMarkEasy()}
        >
          <Text>{i18n.t("cards.popupMenu.tooEasy")}</Text>
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
    backgroundColor: "lightgrey",
    marginHorizontal: 20,
  },

  noMoreCardsTextView: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  noMoreCardsText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 40,
  },
  scoreText: {
    fontSize: 20,

    paddingBottom: 40,
  },
  topPanel: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    justifyContent: "flex-start",
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
