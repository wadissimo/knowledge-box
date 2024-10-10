import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SessionCard } from "@/data/SessionCardModel";
import useMediaDataService from "@/service/MediaDataService";
import { Card } from "@/data/CardModel";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const CardComponent: React.FC<{
  currentCard: SessionCard;
  onUserResponse: Function;
}> = ({ currentCard, onUserResponse }) => {
  const [cardFlip, setCardFlip] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);

  const { playSound } = useMediaDataService();

  useEffect(() => {
    setCardFlip(false);
    setAnswerShown(false);
  }, [currentCard]);

  function handleCardFlip() {
    if (
      !cardFlip &&
      currentCard &&
      currentCard.card &&
      currentCard.card.backSound
    ) {
      handlePlay(currentCard.card.backSound);
    }
    setCardFlip((flip) => !flip);
    setAnswerShown(true);
  }

  async function handlePlay(soundId: number | null) {
    if (soundId !== null) {
      await playSound(soundId); //TODO: remove -
    }
  }

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} onPress={handleCardFlip}>
        {cardFlip ? (
          <CardBackSide currentCard={currentCard} onSoundPlay={handlePlay} />
        ) : (
          <CardFrontSide currentCard={currentCard} onSoundPlay={handlePlay} />
        )}
      </TouchableOpacity>
      {answerShown && (
        <View style={styles.cardBtnsContainer}>
          <TouchableOpacity
            style={[styles.cardBtn, styles.redCardBtn]}
            onPress={() => onUserResponse("again")}
          >
            <Text style={[styles.cardBtnText]}>Don't know</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardBtn, styles.lightGreenCardBtn]}
            onPress={() => onUserResponse("hard")}
          >
            <Text style={[styles.cardBtnText]}>Hard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardBtn, styles.greenCardBtn]}
            onPress={() => onUserResponse("good")}
          >
            <Text style={[styles.cardBtnText]}>Good</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardBtn, styles.greenCardBtn]}
            onPress={() => onUserResponse("easy")}
          >
            <Text style={[styles.cardBtnText]}>Too Easy</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 20 }}></View>
    </View>
  );
};

const CardFrontSide = ({
  currentCard,
  onSoundPlay,
}: {
  currentCard: SessionCard;
  onSoundPlay: Function;
}) => {
  const card: Card | null | undefined = currentCard.card;
  return (
    <>
      <View style={styles.frontBackTextView}>
        <Text style={styles.frontBackText}>Front</Text>
      </View>
      <View style={styles.cardTextView}>
        <Text style={styles.cardText}>{currentCard.card?.front}</Text>
        {card && card.frontSound && (
          <View style={styles.soundContainer}>
            <TouchableOpacity onPress={() => onSoundPlay(card.frontSound)}>
              <Icon name="play-circle-outline" size={48} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const CardBackSide = ({
  currentCard,
  onSoundPlay,
}: {
  currentCard: SessionCard;
  onSoundPlay: Function;
}) => {
  const card: Card | null | undefined = currentCard.card;
  return (
    <>
      <View style={styles.frontBackTextView}>
        <Text style={styles.frontBackText}>Back</Text>
      </View>
      <View style={styles.cardTextView}>
        <Text style={styles.cardText}>{card?.back}</Text>
      </View>
      {card && card.backSound && (
        <View style={styles.soundContainer}>
          <TouchableOpacity onPress={() => onSoundPlay(card.backSound)}>
            <Icon name="play-circle-outline" size={48} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    margin: 20,
  },
  card: {
    padding: 10,
    height: 500,
    width: 300,
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
  lightGreenCardBtn: {
    backgroundColor: "green",
    color: "white",
  },
  greenCardBtn: {
    backgroundColor: "blue",
    color: "white",
  },
  redCardBtn: {
    backgroundColor: "darkred",
    color: "white",
  },
  blueCardBtn: {
    backgroundColor: "blue",
    color: "white",
  },
  greyCardBtn: {
    backgroundColor: "grey",
    color: "white",
  },
  cardBtnText: {
    //backgroundColor: "green",
    color: "white",
  },

  frontBackTextView: {
    flex: 0,
  },
  frontBackText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardTextView: {
    flex: 1,
    justifyContent: "center",
  },
  cardText: {
    fontSize: 20,
  },
  soundContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 20,
  },
});

export default CardComponent;
