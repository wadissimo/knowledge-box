import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";

import { useLocalSearchParams } from "expo-router";
import CardComponent from "@/src/components/CardComponent";
import { Card, useCardModel } from "@/src/data/CardModel";
import { useTheme } from "@react-navigation/native";
import {
  Session,
  SessionStatus,
  useSessionModel,
} from "@/src/data/SessionModel";
import { SessionCard, useSessionCardModel } from "@/src/data/SessionCardModel";
import { useCardTrainingService } from "@/src/service/CardTrainingService";
import useDefaultTrainer from "@/src/service/trainers/DefaultTrainer";
import { Trainer } from "@/src/service/trainers/Trainer";
import { formatInterval } from "@/src/lib/TimeUtils";
import useMediaDataService from "@/src/service/MediaDataService";

const stripTimeFromDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // This will return the date in YYYY-MM-DD format
};

const NEW_CARDS_PER_DAY = 10;
const LEARNING_CARDS_PER_DAY = 50;
const REPEAT_CARDS_PER_DAY = 200;

const DEBUG = false;

const TrainCollection = () => {
  const { colors } = useTheme();
  const { collectionId } = useLocalSearchParams();

  const trainer: Trainer = useDefaultTrainer(
    collectionId !== null && collectionId !== "" ? Number(collectionId) : -1,
    NEW_CARDS_PER_DAY,
    REPEAT_CARDS_PER_DAY,
    LEARNING_CARDS_PER_DAY
  );

  const { updateSession: updateSessionDb, getStartedSession } =
    useSessionModel();
  const { getCurrentCards } = useCardTrainingService();

  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const { playSound, getImageSource } = useMediaDataService();

  function selectNextCard() {
    if (session === null) {
      setCurrentCard(null);
      return;
    }
    setLoading(true);
    trainer.getNextCard(session.id).then((card) => {
      console.log("curent card", card);
      setCurrentCard(card);
      setLoading(false);
    });
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

    setSession(session);
    setSessionCards(sessionCards);
    setLoading(true);
  }

  useEffect(() => {
    updateSession();
  }, [collectionId]);

  useEffect(() => {
    selectNextCard();
  }, [session]);

  const resetTraining = async () => {
    console.log("training reset");
    const curDateStripped = stripTimeFromDate(new Date());
    var session = await getStartedSession(
      Number(collectionId),
      curDateStripped
    );
    if (session === null) throw Error("can't find session");
    session.status = SessionStatus.Abandoned;
    await updateSessionDb(session);
    console.log("session removed: ", session.id);
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

  if (loading) return null;
  if (session === null) return null;
  return (
    <View style={styles.container}>
      {currentCard ? (
        <CardComponent
          currentCard={currentCard}
          onUserResponse={handleUserResponse}
          cardDimensions={{ height: 500, width: 300 }}
          playSound={playSound}
          getImageSource={getImageSource}
        />
      ) : (
        <View style={styles.noMoreCardsTextView}>
          <Text style={styles.noMoreCardsText}>
            Well done. Training complete!
          </Text>
          <Text>Total Card Views: {session.totalViews}</Text>
          <Text>New Cards: {session.newCards}</Text>
          <Text>
            Review Cards: {session.reviewCards + session.learningCards}
          </Text>
          <Text>Successful Responses: {session.successResponses}</Text>
          <Text>Failed Responses: {session.failedResponses}</Text>

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
