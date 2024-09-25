import React, { useEffect, useState } from "react";
import styles from "./Training.module.css";

import { useParams } from "react-router-dom";
import { useCollections } from "../../context/CollectionContext";
import Card from "../card/Card";
import { Button } from "@mui/material";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const Training = () => {
  const { collections, updateCollection } = useCollections();

  const [isFlipped, setIsFlipped] = useState(false);
  const { collectionId } = useParams();
  const currentCollection = collections.find(
    (collection) => Number(collection.id) === Number(collectionId)
  );

  const [currentCard, setCurrentCard] = useState(null);

  useEffect(
    function () {
      if (!currentCollection) return;
      // Find the card with minimal repeatTime or a null repeatTime

      const curCard = currentCollection.cards.reduce((acc, card) => {
        if (
          acc === null ||
          !card.repeatTime ||
          (acc.repeatTime &&
            card.repeatTime &&
            card.repeatTime < acc.repeatTime)
        ) {
          return card;
        }
        return acc;
      }, null);
      console.log("curCard", curCard);
      setCurrentCard(curCard);
    },
    [currentCollection]
  );

  // Protect from empty results
  if (!currentCollection || !currentCard) return <div>No Cards available</div>;

  const dontKnowAddedTime = 30 * SECOND;
  const repeatAddedTime = 2 * MINUTE;
  const rememberAddedTime = 12 * HOUR;
  const knowWellAddedTime = 4 * DAY;

  //Flip Card
  function handleCardClick() {
    console.log("card click", isFlipped);
    setIsFlipped((val) => !val); // reverse
  }

  // Button handlers
  function handleActionButton(addedTime) {
    // auto flip card, if not yet flipped
    if (!isFlipped) handleCardClick();

    // TODO: update only one card instead of all
    updateCollection({
      ...currentCollection,
      cards: currentCollection.cards.map((card) =>
        card.id !== currentCard.id
          ? card
          : {
              ...card,
              repeatTime: (card.repeatTime || Date.now()) + addedTime,
            }
      ),
    });
  }

  //setCurrentCard(currentCollection.cards[0]);
  return (
    <div>
      <Card card={currentCard} />
      <div className={styles.buttons}>
        <Button
          variant="outlined"
          onClick={() => handleActionButton(dontKnowAddedTime)}
        >
          Don't know
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleActionButton(repeatAddedTime)}
        >
          Repeat
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleActionButton(rememberAddedTime)}
        >
          Remember
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleActionButton(knowWellAddedTime)}
        >
          Know Well
        </Button>
      </div>
    </div>
    // <div className={styles.card} onClick={handleCardClick}>
    //   <div className={isFlipped ? styles.flipped : ""}>
    //     <div style={{ padding: "20px" }} className={styles.front}>
    //       <div className={styles.top}>{currentCollection.name}</div>
    //       <div className={styles.top}>Front</div>
    //       <div className={styles.middle}>{curCard.frontText}</div>
    //       <div className={styles.bottom}>Buttons</div>
    //     </div>
    //     <div style={{ padding: "20px" }} className={styles.back}>
    //       <div className={styles.top}>{currentCollection.name}</div>
    //       <div className={styles.top}>Back</div>
    //       <div className={styles.middle}>{curCard.backText}</div>
    //       <div className={styles.bottom}>Buttons</div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Training;
