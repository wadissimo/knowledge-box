import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";

import { useLocalSearchParams } from "expo-router";
import CardComponent from "@/src/components/CardComponent";
import { Card, useCardModel } from "@/src/data/CardModel";
import { useTheme } from "@react-navigation/native";
import { Session, useSessionModel } from "@/src/data/SessionModel";
import { SessionCard, useSessionCardModel } from "@/src/data/SessionCardModel";
import { useCardTrainingService } from "@/src/service/CardTrainingService";

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

const NEW_CARDS_PER_DAY = 20;
const REPEAT_CARDS_PER_DAY = 20;
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

const DEBUG = false;

const TrainCollection = () => {
  const { colors } = useTheme();
  const { collectionId } = useLocalSearchParams();

  const { updateCard } = useCardModel();

  const { newSession, deleteSession, getSession } = useSessionModel();
  const {
    newSessionCard,
    updateSessionCard,
    deleteSessionCard,
    getSessionCards,
  } = useSessionCardModel();
  const { selectNewTrainingCards, selectToRepeatTrainingCards } =
    useCardTrainingService();

  const [currentCard, setCurrentCard] = useState<SessionCard | null>(null);
  const [sessionCards, setSessionCards] = useState<SessionCard[]>([]);

  //   const sortedSessionCards = sessionCards
  //     .slice()
  //     .sort((a, b) => (a.sessionOrder ?? 0) - (b.sessionOrder ?? 0));
  //   console.log("sortedSessionCards:", sortedSessionCards.length);
  //   sortedSessionCards.forEach((s: SessionCard) => {
  //     console.log("sortedSessionCards", s.sessionOrder, s.cardId);
  //   });

  function selectNextCard() {
    if (sessionCards === null || sessionCards.length === 0) {
      setCurrentCard(null);
      return;
    }
    // get a card with earliest repeatTime:
    var minSessionOrder: number | null = null;
    var selectedSessionCard: SessionCard | null = null;
    sessionCards.forEach((sessionCard) => {
      if (
        minSessionOrder === null ||
        (sessionCard.sessionOrder !== null &&
          sessionCard.sessionOrder < minSessionOrder)
      ) {
        minSessionOrder = sessionCard.sessionOrder;
        selectedSessionCard = sessionCard;
      }
    });
    setCurrentCard(selectedSessionCard);
  }

  async function updateSession() {
    if (!collectionId) return;

    const curDateStripped = stripTimeFromDate(new Date());

    var session = await getSession(Number(collectionId), curDateStripped);
    // Check if there is a session for the current date (today)
    if (session === null) {
      console.log("Creating a training session");
      session = {
        id: 0,
        collectionId: Number(collectionId),
        trainingDate: curDateStripped,
        newCards: NEW_CARDS_PER_DAY,
        repeatCards: REPEAT_CARDS_PER_DAY,
      };
      await newSession(session);
      // fetch created session
      session = await getSession(Number(collectionId), curDateStripped);
      if (session === null) throw Error("Can't create a session");

      console.log("Creating sessionCards");
      const newCards = await selectNewTrainingCards(
        Number(collectionId),
        NEW_CARDS_PER_DAY
      );
      console.log("new cards");
      //console.log(newCards);

      const curTime: number = Date.now();
      console.log("curTime: ", curTime.toString());
      let cardsToRepeat = await selectToRepeatTrainingCards(
        Number(collectionId),
        curTime
      );

      console.log("cardsToRepeat");
      //console.log(cardsToRepeat);
      if (cardsToRepeat.length < session.repeatCards) {
        // get extra cards from tomorrow
        let extraCardsToRepeat = await selectToRepeatTrainingCards(
          Number(collectionId),
          getTomorrowAsNumber()
        );
        const cardsToRepeatIds = cardsToRepeat.map((card: Card) => card.id);
        // remove repeating cards.
        extraCardsToRepeat = extraCardsToRepeat.filter(
          (card: Card) => !cardsToRepeatIds.includes(card.id)
        );
        console.log("extraCardsToRepeat");
        //console.log(extraCardsToRepeat);
        if (
          extraCardsToRepeat.length >
          session.repeatCards - cardsToRepeat.length
        ) {
          // get only as many cards as we need
          extraCardsToRepeat = extraCardsToRepeat.slice(
            0,
            session.repeatCards - cardsToRepeat.length
          );
        }
        cardsToRepeat = cardsToRepeat.concat(extraCardsToRepeat);
      }
      // TODO: get max cards only
      // Mix all cards
      var combinedArray: Card[] = [];
      if (newCards) combinedArray = combinedArray.concat(newCards);
      if (cardsToRepeat) combinedArray = combinedArray.concat(cardsToRepeat);
      console.log("combinedArray");
      //console.log(combinedArray);
      // shuffle combined array
      for (let i = combinedArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedArray[i], combinedArray[j]] = [
          combinedArray[j],
          combinedArray[i],
        ];
      }
      console.log("combinedArray, size", combinedArray.length);
      for (let i = 0; i < combinedArray.length; i++) {
        const card = combinedArray[i];
        const nsc: SessionCard = {
          sessionId: session.id,
          cardId: card.id,
          type: card.repeatTime ? "repeat" : "new",
          status: "training",
          sessionOrder: i,
          successfulRepeats: card.successfulRepeats ?? 0,
        };

        await newSessionCard(nsc); // TODO: parallel
      }
    } else {
      console.log("training session already exists");
    }
    const sessionCards = await getSessionCards(session.id);

    setSessionCards(sessionCards);
  }

  useEffect(() => {
    updateSession();
  }, [collectionId]);

  useEffect(() => {
    selectNextCard();
  }, [sessionCards]);

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
    if (!currentCard || !currentCard.card) return;
    const card = currentCard.card;
    const today = truncateTime(new Date());
    let easeFactor = card.easeFactor ?? INITIAL_EASE_FACTOR;
    let interval = card.interval ?? INITIAL_INTERVAL;

    let updatedSessionCards = sessionCards;
    const totalCards = sessionCards.length;

    switch (userResponse) {
      case "again":
        console.log("again");
        // reset card
        card.easeFactor = Math.max(
          MIN_EASE_FACTOR,
          easeFactor - AGAIN_DELTA_EASE_FACTOR
        );
        card.successfulRepeats = 0;
        card.failedRepeats = (card.failedRepeats ?? 0) + 1;
        card.interval = 1;
        currentCard.successfulRepeats = 0;
        // set a new order in the session

        currentCard.sessionOrder =
          (currentCard.sessionOrder ?? 0) +
          Math.max(
            AGAIN_ORDER_INCREASE,
            AGAIN_ORDER_INCREASE_PROC * totalCards
          );
        console.log("push sessionOrder: ", currentCard.sessionOrder);
        // update database
        await updateCard(card);
        await updateSessionCard(currentCard);

        console.log(currentCard);

        break;

      case "hard":
        console.log("hard");
        //currentCard.successfulRepeats += 1;
        // TODO:
        card.easeFactor = Math.max(
          MIN_EASE_FACTOR,
          easeFactor - HARD_DELTA_EASE_FACTOR
        );
        //card.failedRepeats = 0;

        currentCard.sessionOrder =
          (currentCard.sessionOrder ?? 0) +
          Math.max(HARD_ORDER_INCREASE, HARD_ORDER_INCREASE_PROC * totalCards);
        console.log("push sessionOrder: ", currentCard.sessionOrder);
        // update database
        await updateCard(card);
        await updateSessionCard(currentCard);

        console.log(currentCard);

        break;

      case "good":
        console.log("good");
        currentCard.successfulRepeats += 1;
        console.log(
          "currentCard successfulRepeats",
          currentCard.successfulRepeats
        );
        if (currentCard.successfulRepeats > SESSION_MAX_SUCCESSFUL_REPEATS) {
          // push into next days
          card.successfulRepeats = currentCard.successfulRepeats;
          console.log("card successfulRepeats", card.successfulRepeats);
          card.failedRepeats = 0;
          card.interval = Math.max(1, Math.round(interval * easeFactor));
          card.prevRepeatTime = today;
          card.repeatTime = today + card.interval * ONE_DAY;
          console.log(
            "push into the next day, successfulRepeats:",
            card.successfulRepeats,
            ", repeat ",
            new Date(card.repeatTime)
          );
          await deleteSessionCard(currentCard.sessionId, currentCard.cardId);
          // remove card from the current session
          updatedSessionCards = sessionCards.filter(
            (sessionCard) => sessionCard.cardId !== currentCard.cardId
          );
          // update card
          await updateCard(card);
        } else {
          // Shuffle back in
          currentCard.sessionOrder =
            (currentCard.sessionOrder ?? 0) +
            Math.max(
              GOOD_ORDER_INCREASE,
              GOOD_ORDER_INCREASE_PROC * totalCards
            );
          console.log("push sessionOrder: ", currentCard.sessionOrder);
          // update database
          await updateSessionCard(currentCard);
        }

        console.log(currentCard);
        break;

      case "easy":
        console.log("easy");
        card.easeFactor = easeFactor + 0.15;
        card.successfulRepeats = (card.successfulRepeats ?? 0) + 1;
        console.log("card successfulRepeats", card.successfulRepeats);
        // push into next days
        card.failedRepeats = 0;
        card.interval = Math.round(
          interval * easeFactor * EASY_INTERVAL_GROW_FACTOR
        );
        // update schedule
        card.prevRepeatTime = today;
        card.repeatTime = today + card.interval * ONE_DAY;

        console.log(
          "push into the next day, successfulRepeats:",
          card.successfulRepeats,
          ", repeat ",
          new Date(card.repeatTime)
        );
        // remove the card from the session
        await deleteSessionCard(currentCard.sessionId, currentCard.cardId);

        // update card
        await updateCard(card);

        console.log(currentCard);
        // remove card from the current session
        updatedSessionCards = sessionCards.filter(
          (sessionCard) => sessionCard.cardId !== currentCard.cardId
        );
        break;
    }
    //reorder updated list of cards

    updatedSessionCards = updatedSessionCards
      .slice()
      .sort((a, b) => (a.sessionOrder ?? 0) - (b.sessionOrder ?? 0));
    updatedSessionCards.forEach((s, i) => {
      s.sessionOrder = i; // reindex order
    });
    setSessionCards(updatedSessionCards);
  }

  return (
    <View style={styles.container}>
      {currentCard ? (
        <CardComponent
          currentCard={currentCard}
          onUserResponse={handleUserResponse}
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
