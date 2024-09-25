import React, { useState } from "react";
import styles from "./Training.module.css";

import { useParams } from "react-router-dom";
import { useCollections } from "../../context/CollectionContext";
import Card from "../card/Card";
import { Button } from "@mui/material";

const Training = () => {
  const { collections } = useCollections();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { collectionId } = useParams();
  const currentCollection = collections.find(
    (collection) => Number(collection.id) === Number(collectionId)
  );

  if (!currentCollection) return;
  const curCard = currentCollection.cards[0];

  function handleCardClick() {
    console.log("card click", isFlipped);
    setIsFlipped((val) => !val); // reverse
  }
  //setCurrentCard(currentCollection.cards[0]);
  return (
    <div>
      <Card card={curCard} />
      <div className={styles.buttons}>
        <Button variant="outlined">Don't know</Button>
        <Button variant="outlined">Repeat</Button>
        <Button variant="outlined">Remember</Button>
        <Button variant="outlined">Know Well</Button>
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
