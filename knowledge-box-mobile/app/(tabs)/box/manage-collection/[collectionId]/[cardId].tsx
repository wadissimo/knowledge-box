import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

import { Card, useCardModel } from "@/src/data/CardModel";

import useMediaDataService from "@/src/service/MediaDataService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { i18n } from "@/src/lib/i18n";
import { useAppTheme } from "@/src/hooks/useAppTheme";

const EditFlashcard = () => {
  const router = useRouter();
  const { colors } = useAppTheme();

  const { collectionId, cardId } = useLocalSearchParams();

  const [frontSide, setFrontSide] = useState<string>("");
  const [backSide, setBackSide] = useState<string>("");
  const { getCardById, newCard, updateCardFrontBack } = useCardModel();

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
          title: i18n.t("cards.newCardTitle"),
        });
      } else {
        const card = await getCardById(Number(cardId));
        if (card === null) throw Error("Can't find a card:" + cardId);

        setCard(card);
        setFrontSide(card.front);
        setBackSide(card.back);
        navigation.setOptions({
          title: i18n.t("cards.editCardTitle"),
        });
      }
    }
    fetchCards();
  }, [collectionId, cardId]);

  const handleSave = () => {
    if (!frontSide || !backSide) {
      Alert.alert(i18n.t("common.error"), i18n.t("cards.error.emptySides"));
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
      await playSound(soundId);
    }
  }

  return (
    // <KeyboardAwareScrollView style={styles.container} enableOnAndroid={true}>
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 0.8 }}>
        <Text style={styles.label}>{i18n.t("cards.frontSide")}</Text>
        <TextInput
          style={styles.input}
          value={frontSide}
          onChangeText={setFrontSide}
          placeholder={i18n.t("cards.frontSide")}
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
        <Text style={styles.label}>{i18n.t("cards.backSide")}</Text>
        <TextInput
          style={styles.input}
          value={backSide}
          onChangeText={setBackSide}
          placeholder={i18n.t("cards.backSide")}
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
      </ScrollView>

      <Button
        title={i18n.t("common.save")}
        onPress={handleSave}
        color={colors.primary}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    //backgroundColor: "#F5F5F5",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    //textAlign: "center",
  },
  multilineInput: {},
  input: {
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#555",
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
