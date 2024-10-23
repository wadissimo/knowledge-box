import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";

import { useLocalSearchParams } from "expo-router";
import CardComponent from "@/src/components/CardComponent";
import { Card, useCardModel } from "@/src/data/CardModel";
import { useTheme } from "@react-navigation/native";
import { Session, useSessionModel } from "@/src/data/SessionModel";
import { SessionCard, useSessionCardModel } from "@/src/data/SessionCardModel";
import { useCardTrainingService } from "@/src/service/CardTrainingService";
import useDefaultTrainer from "@/src/service/trainers/DefaultTrainer";
import { Trainer } from "@/src/service/trainers/Trainer";

const stripTimeFromDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // This will return the date in YYYY-MM-DD format
};
const getTomorrowAsNumber = (): number => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

const truncateTime = (date: Date): number => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate.getTime();
};

const NEW_CARDS_PER_DAY = 10;
const LEARNING_CARDS_PER_DAY = 50;
const REPEAT_CARDS_PER_DAY = 200;

const ONE_DAY: number = 24 * 60 * 60 * 1000;
const AGAIN_ORDER_INCREASE = 5;
const AGAIN_ORDER_INCREASE_PROC = 0.1;
const HARD_ORDER_INCREASE = 6; // todo: % ?
const HARD_ORDER_INCREASE_PROC = 0.25;
const GOOD_ORDER_INCREASE = 7;
const GOOD_ORDER_INCREASE_PROC = 0.7;
const INTERVAL_GROW_FACTOR = 1.2;
const EASY_INTERVAL_GROW_FACTOR = 1.3;
const INITIAL_INTERVAL = 1;
const SESSION_MAX_SUCCESSFUL_REPEATS = 2;
const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const AGAIN_DELTA_EASE_FACTOR = 0.2;
const HARD_DELTA_EASE_FACTOR = 0.1;

const DEBUG = true;

const TrainCollection = () => {
  const { colors } = useTheme();
  const { collectionId } = useLocalSearchParams();

  const trainer: Trainer = useDefaultTrainer(
    collectionId !== null && collectionId !== "" ? Number(collectionId) : -1,
    NEW_CARDS_PER_DAY,
    REPEAT_CARDS_PER_DAY,
    LEARNING_CARDS_PER_DAY
  );

  const { updateCard } = useCardModel();

  const { deleteSession, getSession } = useSessionModel();
  const { updateSessionCard, deleteSessionCard, getSessionCards } =
    useSessionCardModel();

  const [session, setSession] = useState<Session | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [sessionCards, setSessionCards] = useState<SessionCard[]>([]);

  function selectNextCard() {
    if (
      session === null ||
      sessionCards === null ||
      sessionCards.length === 0
    ) {
      setCurrentCard(null);
      return;
    }
    trainer.getNextCard(session.id).then((card) => {
      setCurrentCard(card);
    });
  }

  async function updateSession() {
    if (!collectionId) return;
    const curDateStripped = stripTimeFromDate(new Date());

    var session = await trainer.getSession(curDateStripped);
    if (session === null) {
      console.log("Creating a training session");
      session = await trainer.createSession(curDateStripped);
    }
    const sessionCards = await getSessionCards(session.id);

    setSession(session);
    setSessionCards(sessionCards);
    selectNextCard();
  }

  useEffect(() => {
    updateSession();
  }, [collectionId]);

  const resetTraining = async () => {
    console.log("training reset");
    const curDateStripped = stripTimeFromDate(new Date());
    var session = await getSession(Number(collectionId), curDateStripped);
    if (session === null) throw Error("can't find session");
    await deleteSession(session.id);
    console.log("session removed: ", session.id);
    await updateSession();
  };

  async function handleUserResponse(
    userResponse: "again" | "hard" | "good" | "easy"
  ) {
    if (session === null || currentCard === null) return;

    await trainer.processUserResponse(session.id, currentCard, userResponse);

    const sessionCards = await getSessionCards(session.id);
    setSessionCards(sessionCards);
    selectNextCard();
  }

  return (
    <View style={styles.container}>
      {currentCard ? (
        <CardComponent
          currentCard={currentCard}
          onUserResponse={handleUserResponse}
          cardDimensions={{ height: 200, width: 100 }}
        />
      ) : (
        <View style={styles.noMoreCardsTextView}>
          <Text style={styles.noMoreCardsText}>
            Well done. Training complete!
          </Text>
          <Text style={styles.scoreText}>Your score: XXX</Text>
          <View>
            <Button
              title="New Training"
              onPress={resetTraining}
              color={colors.primary}
            />
          </View>
        </View>
      )}
      {DEBUG && (
        <>
          <ScrollView style={styles.scrollView}>
            {sessionCards.map((sessionCard: SessionCard) => {
              return (
                sessionCard.card && (
                  <View
                    style={{ flexDirection: "row", gap: 2 }}
                    key={`card-${sessionCard.card.id}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text>{sessionCard.card?.front}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      {/* <Text>Back: {sessionCard.card?.back}</Text> */}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text>{sessionCard.sessionOrder}</Text>
                    </View>
                  </View>
                )
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
});
export default TrainCollection;
