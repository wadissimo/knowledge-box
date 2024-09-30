import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useDatabase } from "@/context/DatabaseContext";

const EditFlashcard = () => {
  const router = useRouter();

  const { collectionId, cardId } = useLocalSearchParams();

  const [frontSide, setFrontSide] = useState<string>("");
  const [backSide, setBackSide] = useState<string>("");
  const { getCardById, newCard, updateCardFrontBack } = useDatabase();
  //console.log("cardId", cardId);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchCards() {
      if (cardId === "new") {
        setFrontSide("");
        setBackSide("");
        navigation.setOptions({
          title: "New Card",
        });
      } else {
        const card = await getCardById(cardId);

        setFrontSide(card.front);
        setBackSide(card.back);
        navigation.setOptions({
          title: "Edit Card",
        });
      }
    }
    fetchCards();
  }, [collectionId, cardId]);

  const handleSave = () => {
    if (!frontSide || !backSide) {
      Alert.alert("Error", "Both front and back sides must be filled.");
      return;
    }
    if (cardId === "new") {
      newCard(collectionId, frontSide, backSide);
      router.back();
      router.replace(`/manage-collection/${collectionId}/?affectedCardId=-1`);
    } else {
      updateCardFrontBack(Number(cardId), frontSide, backSide);
      router.back();
      router.replace(
        `/manage-collection/${collectionId}/?affectedCardId=${cardId}`
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.label}>Edit Flashcard</Text> */}

      <TextInput
        style={styles.input}
        value={frontSide}
        onChangeText={setFrontSide}
        placeholder="Front side"
        multiline
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        value={backSide}
        onChangeText={setBackSide}
        placeholder="Back side"
        multiline
        numberOfLines={4}
      />

      <Button title="Save" onPress={handleSave} color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    //textAlign: "center",
    color: "#333",
  },
  multilineInput: {},
  input: {
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
    height: 150,
  },
});

export default EditFlashcard;
