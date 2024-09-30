import { View, Text, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { Card, useDatabase } from "@/context/DatabaseContext";
import { useLocalSearchParams } from "expo-router";

const TrainCollection = () => {
  const { collectionId } = useLocalSearchParams();
  const newCardsCount = 4;
  const {
    selectNewTrainingCards,
    updateCardRepeatTime,
    selectToRepeatTrainingCard,
  } = useDatabase();
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  async function selectCurrentCard() {
    //console.log("collectionId", collectionId);
    const newCards = await selectNewTrainingCards(collectionId, newCardsCount);
    setCards(newCards);
    // if (newCard !== null) {
    //   setCurrentCard(newCard);
    // } else {
    //   const toRepeat = await selectToRepeatTrainingCard(collectionId);
    //   if (toRepeat !== null) {
    //     setCurrentCard(toRepeat);
    //   } else {
    //     setCurrentCard(null);
    //   }
    // }
  }

  useEffect(() => {
    selectCurrentCard();
  }, [collectionId]);

  //   if (currentCard === null) {
  //     return (
  //       <View>
  //         <Text>No Cards Available for training</Text>
  //       </View>
  //     );
  //   }

  function handleUpdate() {
    if (currentCard !== null) {
      updateCardRepeatTime(currentCard.id, Date.now() + 5000);
      selectCurrentCard();
    }
  }

  return (
    <View>
      {cards.map((card: Card) => (
        <View style={{ flexDirection: "row" }}>
          <View>
            <Text>Front: {card.front}</Text>
          </View>
          <View>
            <Text>Back: {card.back}</Text>
          </View>
        </View>
      ))}

      <View>
        <Button title="Update" onPress={handleUpdate} />
      </View>
    </View>
  );
};

export default TrainCollection;
