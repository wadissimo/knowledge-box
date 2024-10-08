import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SessionCard } from "@/context/DatabaseContext";

const CardComponent: React.FC<{
  currentCard: SessionCard;
  onUserResponse: Function;
}> = ({ currentCard, onUserResponse }) => {
  const [cardFlip, setCardFlip] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);

  useEffect(() => {
    setCardFlip(false);
    setAnswerShown(false);
  }, [currentCard]);

  function handleCardFlip() {
    setCardFlip((flip) => !flip);
    setAnswerShown(true);
  }

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} onPress={handleCardFlip}>
        {cardFlip ? (
          <>
            <View style={styles.frontBackTextView}>
              <Text style={styles.frontBackText}>Back</Text>
            </View>
            <View style={styles.cardTextView}>
              <Text>{currentCard.card?.back}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.frontBackTextView}>
              <Text style={styles.frontBackText}>Front</Text>
            </View>
            <View style={styles.cardTextView}>
              <Text>{currentCard.card?.front}</Text>
            </View>
          </>
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
    fontWeight: "bold",
  },
  cardTextView: {
    flex: 1,
    justifyContent: "center",
  },
});

export default CardComponent;
