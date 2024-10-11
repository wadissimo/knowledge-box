import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

import { Card, useCardModel } from "@/data/CardModel";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import useMediaDataService from "@/service/MediaDataService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Audio } from "expo-av";

const EditFlashcard = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const { collectionId, cardId } = useLocalSearchParams();

  const [frontSide, setFrontSide] = useState<string>("");
  const [backSide, setBackSide] = useState<string>("");
  const { getCardById, newCard, updateCardFrontBack } = useCardModel();

  //console.log("cardId", cardId);
  const navigation = useNavigation();

  // Media
  const [card, setCard] = useState<Card | null>(null);
  const { loading, playSound } = useMediaDataService();

  useEffect(() => {
    async function fetchCards() {
      if (cardId === "new") {
        setFrontSide("");
        setBackSide("");
        navigation.setOptions({
          title: "New Card",
        });
      } else {
        const card = await getCardById(Number(cardId));
        if (card === null) throw Error("Can't find a card:" + cardId);
        // console.log("card.backSound", card.backSound);
        // if (card.backSound !== null && card.backSound < 0) {
        //   importGlobalSoundIfNotExists(-card.backSound); //async
        // }
        // if (card.frontSound !== null && card.frontSound < 0) {
        //   importGlobalSoundIfNotExists(-card.frontSound); //async
        // }
        setCard(card);
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
      newCard(Number(collectionId), frontSide, backSide);
      router.back();
      router.replace(
        `/(tabs)/box/manage-collection/${collectionId}/manage?affectedCardId=-1`
      );
    } else {
      updateCardFrontBack(Number(cardId), frontSide, backSide);
      router.back();
      router.replace(
        `/(tabs)/box/manage-collection/${collectionId}/manage?affectedCardId=${cardId}`
      );
    }
  };

  async function handlePlay(soundId: number | null) {
    if (soundId !== null) {
      await playSound(soundId); //TODO: remove -
    }
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.label}>Edit Flashcard</Text> */}

      <TextInput
        style={styles.input}
        value={frontSide}
        onChangeText={setFrontSide}
        placeholder="Front side"
        multiline
        numberOfLines={3}
      />
      {card !== null && card.frontSound && (
        <View style={styles.soundContainer}>
          <TouchableOpacity onPress={() => handlePlay(card.frontSound)}>
            <Icon name="play-circle-outline" size={42} color="black" />
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.input}
        value={backSide}
        onChangeText={setBackSide}
        placeholder="Back side"
        multiline
        numberOfLines={3}
      />
      {card !== null && card.backSound && (
        <View style={styles.soundContainer}>
          <TouchableOpacity onPress={() => handlePlay(card.backSound)}>
            <Icon name="play-circle-outline" size={42} color="black" />
          </TouchableOpacity>
        </View>
      )}

      <Button title="Save" onPress={handleSave} color={colors.primary} />
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
    height: 120,
  },
  soundContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 20,
  },
});

export default EditFlashcard;
