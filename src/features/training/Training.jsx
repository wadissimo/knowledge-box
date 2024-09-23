import React, { useState } from "react";
import styles from "./Training.module.css";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

import { tableCellClasses } from "@mui/material/TableCell";
import { Link, useParams } from "react-router-dom";
import { useCollections } from "../../context/CollectionContext";

const Training = () => {
  const { collections } = useCollections();
  const [currentCard, setCurrentCard] = useState();
  const [isFlipped, setIsFlipped] = useState(false);
  const { collectionId } = useParams();
  const currentCollection = collections.find(
    (collection) => collection.id === parseInt(collectionId)
  );

  console.log("currentCollection", currentCollection);
  const curCard = currentCollection.cards[0];

  function handleCardClick() {
    console.log("card click", isFlipped);
    setIsFlipped((val) => !val); // reverse
  }
  //setCurrentCard(currentCollection.cards[0]);
  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={isFlipped ? styles.flipped : ""}>
        <div style={{ padding: "20px" }} className={styles.front}>
          <div className={styles.top}>{currentCollection.name}</div>
          <div className={styles.top}>Front</div>
          <div className={styles.middle}>{curCard.frontText}</div>
          <div className={styles.bottom}>Buttons</div>
        </div>
        <div style={{ padding: "20px" }} className={styles.back}>
          <div className={styles.top}>{currentCollection.name}</div>
          <div className={styles.top}>Back</div>
          <div className={styles.middle}>{curCard.backText}</div>
          <div className={styles.bottom}>Buttons</div>
        </div>
      </div>
    </div>
  );
};

export default Training;
