import {
  View,
  Text,
  Button,
  StyleSheet,
  Touchable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Card,
  useDatabase,
  Session,
  SessionCard,
} from "@/context/DatabaseContext";
import { useLocalSearchParams } from "expo-router";

const stripTimeFromDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // This will return the date in YYYY-MM-DD format
};

const NEW_CARDS_PER_DAY = 3;
const REPEAT_CARDS_PER_DAY = 3;

const TrainCollection = () => {
  const { collectionId } = useLocalSearchParams();
  const [newCardsCount, setNewCardsCount] = useState(0);

  const {
    selectNewTrainingCards,
    updateCardRepeatTime,
    selectToRepeatTrainingCard,
    getSession,
    getSessionCards,
    createSession,
    createSessionCard,
    removeSession,
  } = useDatabase();

  const [currentCard, setCurrentCard] = useState<SessionCard | null>(null);
  const [sessionCards, setSessionCards] = useState<SessionCard[]>([]);
  const [cardFlip, setCardFlip] = useState<Boolean>(false);

  function selectNextCard() {
    if (sessionCards === null || sessionCards.length === 0) {
      setCurrentCard(null);
      setCardFlip(false);
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
    setCardFlip(false);
  }

  async function updateSession() {
    if (!collectionId) return;

    const curDateStripped = stripTimeFromDate(new Date());
    var session: Session = await getSession(collectionId, curDateStripped);
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
      await createSession(session);
      // fetch created session
      session = await getSession(collectionId, curDateStripped);

      console.log("Creating sessionCards");
      const newCards = await selectNewTrainingCards(
        collectionId,
        NEW_CARDS_PER_DAY
      );
      for (let i = 0; i < newCards.length; i++) {
        const newSessionCard: SessionCard = {
          sessionId: session.id,
          cardId: newCards[i].id,
          type: "new",
          status: "new",
          sessionOrder: i,
          successfulRepeats: 0,
        };
        await createSessionCard(newSessionCard);
      }
    } else {
      console.log("training session already exists");
    }
    const sessionCards = await getSessionCards(session.id);
    const cards = sessionCards.map(
      (sessionCard: SessionCard) => sessionCard.card
    );
    setSessionCards(sessionCards);

    setNewCardsCount(cards.length);
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
    var session: Session = await getSession(collectionId, curDateStripped);
    await removeSession(session.id);
    console.log("session removed: ", session.id);
    await updateSession();
  };

  function handleUpdate() {
    // if (currentCard !== null) {
    //   updateCardRepeatTime(currentCard.id, Date.now() + 5000);
    //   selectCurrentCard();
    // }
  }
  function handleCardFlip() {
    setCardFlip((flip) => !flip);
  }

  function handleLearnedButton() {
    // mix into the session deck
    const curOrder = currentCard?.sessionOrder;
  }

  function handleTryAgainButton() {}

  return (
    <View>
      {currentCard ? (
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={handleCardFlip}>
            {cardFlip ? (
              <View>
                <Text>Front: {currentCard.card?.front}</Text>
              </View>
            ) : (
              <View>
                <Text>Back: {currentCard.card?.back}</Text>
              </View>
            )}

            <View>
              <Text>Repeat: {currentCard.sessionOrder}</Text>
            </View>
          </TouchableOpacity>
          {cardFlip && (
            <View style={styles.cardBtnsContainer}>
              <TouchableOpacity style={[styles.cardBtn, styles.redCardBtn]}>
                <Text style={[styles.cardBtnText]}>Try again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.cardBtn, styles.greenCardBtn]}>
                <Text style={[styles.cardBtnText]}>I learned it!</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }}></View>
        </View>
      ) : (
        <View>
          <Text>No Cards</Text>
        </View>
      )}

      <View>
        {sessionCards.map((sessionCard: SessionCard) => {
          return (
            sessionCard.card && (
              <View
                style={{ flexDirection: "row", gap: 2 }}
                key={`card-${sessionCard.card.id}`}
              >
                <View>
                  <Text>Front: {sessionCard.card?.front}</Text>
                </View>
                <View>
                  <Text>Back: {sessionCard.card?.back}</Text>
                </View>
                <View>
                  <Text>Repeat: {sessionCard.sessionOrder}</Text>
                </View>
              </View>
            )
          );
        })}
      </View>

      <View>
        <Button title="Update" onPress={handleUpdate} />
      </View>
      <View>
        <Button title="Reset Training" onPress={resetTraining} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    margin: 20,
  },
  card: {
    height: 300,
    width: 200,
    backgroundColor: "lightgreen",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBtnsContainer: {
    margin: 10,
    //backgroundColor: "grey",
    flexDirection: "row",
    gap: 10,
    //width: "100%",
    //height: 50,
  },
  cardBtn: {
    flex: 1,
    padding: 10,

    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  greenCardBtn: {
    backgroundColor: "green",
    color: "white",
  },
  redCardBtn: {
    backgroundColor: "darkred",
    color: "white",
  },
  cardBtnText: {
    //backgroundColor: "green",
    color: "white",
  },
});
export default TrainCollection;
