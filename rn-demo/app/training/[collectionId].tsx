// app/training/[collectionId].tsx
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View, Text, Button, Image } from "react-native";

export default function TrainingScreen() {
  const { collectionId } = useLocalSearchParams(); // Corrected this line
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFront, setShowFront] = useState(true);

  const cards = [
    { id: "1", frontText: "What is 2+2?", backText: "4", image: null },
    {
      id: "2",
      frontText: "Capital of France?",
      backText: "Paris",
      image: null,
    },
  ]; // This would be fetched based on collectionId

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setShowFront(true);
  };

  const currentCard = cards[currentIndex];

  return (
    <View>
      <Text>{showFront ? currentCard.frontText : currentCard.backText}</Text>
      {currentCard.image && (
        <Image
          source={{ uri: currentCard.image }}
          style={{ width: 100, height: 100 }}
        />
      )}
      <Button title="Flip" onPress={() => setShowFront(!showFront)} />
      <Button title="Next" onPress={nextCard} />
    </View>
  );
}
