import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SessionCard } from "@/src/data/SessionCardModel";

import { Card } from "@/src/data/CardModel";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import useMediaDataService from "../service/MediaDataService";
import { i18n } from "../lib/i18n";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const CardComponent: React.FC<{
  currentCard: Card;
  onUserResponse: Function;
  cardDimensions?: { height: number; width: number };
  playSound: Function;
  getImageSource: Function;
}> = ({
  currentCard,
  onUserResponse,
  cardDimensions,
  playSound,
  getImageSource,
}) => {
  const [cardFlip, setCardFlip] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [frontImgSrc, setFrontImgSrc] = useState<string | null>(null);
  const [backImgSrc, setBackImgSrc] = useState<string | null>(null);

  async function loadImages(card: Card) {
    if (card.backImg !== null) {
      console.log("card.backImg", card.backImg);
      //await importGlobalImageIfNotExists(card.backImg);
      setBackImgSrc(await getImageSource(card.backImg));
    }
    if (card.frontImg !== null) {
      console.log("card.frontImg", card.frontImg);
      //await importGlobalImageIfNotExists(card.frontImg);
      const imgSrc = await getImageSource(card.frontImg);
      setFrontImgSrc(imgSrc);
      if (imgSrc) {
        var { exists } = await FileSystem.getInfoAsync(imgSrc);
        if (!exists) {
          console.log("dont exist", imgSrc);
        } else {
          console.log("Do exist", imgSrc);
        }
      }
    }
  }
  useEffect(() => {
    setCardFlip(false);
    setAnswerShown(false);
    if (currentCard) {
      if (currentCard.backImg !== null || currentCard.frontImg !== null) {
        setLoading(true);
        loadImages(currentCard).then(() => {
          setLoading(false);
        });
      }
    }
  }, [currentCard]);

  // if loading do nothing
  if (loading) return;

  function handleCardFlip() {
    if (!cardFlip && currentCard && currentCard.backSound) {
      handlePlay(currentCard.backSound);
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
      <TouchableOpacity
        style={[
          styles.card,
          {
            height: cardDimensions?.height ?? styles.card.height,
            width: cardDimensions?.width ?? styles.card.width,
          },
          ,
          styles.elevation,
          styles.shadowProp,
        ]}
        onPress={handleCardFlip}
      >
        {cardFlip ? (
          <CardBackSide
            currentCard={currentCard}
            onSoundPlay={handlePlay}
            imgSrc={backImgSrc}
          />
        ) : (
          <CardFrontSide
            currentCard={currentCard}
            onSoundPlay={handlePlay}
            imgSrc={frontImgSrc}
          />
        )}
      </TouchableOpacity>
      {answerShown && (
        <View style={styles.cardBtnsContainer}>
          <TouchableOpacity
            style={[
              styles.cardBtn,
              styles.redCardBtn,
              styles.elevation,
              styles.shadowProp,
            ]}
            onPress={() => onUserResponse("again")}
          >
            <Text style={[styles.cardBtnText]}>
              {i18n.t("trainer.responses.dontknow")}
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.cardBtn, styles.lightGreenCardBtn]}
            onPress={() => onUserResponse("hard")}
          >
            <Text style={[styles.cardBtnText]}>Hard</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[
              styles.cardBtn,
              styles.greenCardBtn,
              styles.elevation,
              styles.shadowProp,
            ]}
            onPress={() => onUserResponse("good")}
          >
            <Text style={[styles.cardBtnText]}>
              {i18n.t("trainer.responses.good")}
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.cardBtn, styles.greenCardBtn]}
            onPress={() => onUserResponse("easy")}
          >
            <Text style={[styles.cardBtnText]}>Too Easy</Text>
          </TouchableOpacity> */}
        </View>
      )}

      <View style={{ height: 20 }}></View>
    </View>
  );
};

const CardFrontSide = ({
  currentCard,
  onSoundPlay,
  imgSrc,
}: {
  currentCard: Card;
  onSoundPlay: Function;
  imgSrc: string | null;
}) => {
  return (
    <>
      <View style={styles.frontBackTextView}>
        <Text style={styles.frontBackText}>Front</Text>
      </View>
      {imgSrc && (
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: imgSrc }}
            placeholder={{ blurhash }}
            contentFit="contain"
          />
        </View>
      )}
      <View style={styles.cardTextView}>
        <Text style={styles.cardText}>{currentCard?.front}</Text>
      </View>

      {currentCard && currentCard.frontSound && (
        <View style={styles.soundContainer}>
          <TouchableOpacity onPress={() => onSoundPlay(currentCard.frontSound)}>
            <Icon name="play-circle-outline" size={48} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const CardBackSide = ({
  currentCard,
  onSoundPlay,
  imgSrc,
}: {
  currentCard: Card;
  onSoundPlay: Function;
  imgSrc: string | null;
}) => {
  return (
    <>
      <View style={styles.frontBackTextView}>
        <Text style={styles.frontBackText}>Back</Text>
      </View>
      {imgSrc && (
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: imgSrc }}
            placeholder={{ blurhash }}
            contentFit="contain"
          />
        </View>
      )}
      <View style={styles.cardTextView}>
        <Text style={styles.cardText}>{currentCard?.back}</Text>
      </View>

      {currentCard && currentCard.backSound && (
        <View style={styles.soundContainer}>
          <TouchableOpacity onPress={() => onSoundPlay(currentCard.backSound)}>
            <Icon name="play-circle-outline" size={48} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
    //height: 150,
    width: "100%",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  cardContainer: {
    alignItems: "center",
    margin: 20,
  },
  card: {
    padding: 10,
    height: 500,
    width: 300,
    backgroundColor: "#c2fbc4",
    //backgroundColor: "white",
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
    backgroundColor: "#4b82fa",
    color: "white",
  },
  redCardBtn: {
    backgroundColor: "#fa4b4b",
    color: "white",
  },
  blueCardBtn: {
    backgroundColor: "#6192fa",
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
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 5,
    shadowColor: "#52006A",
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 5,
  },
});

export default CardComponent;
