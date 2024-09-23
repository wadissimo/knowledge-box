import React, { useState } from "react";

import styles from "./Card.module.css";

export default function Card({ card }) {
  const [isFlipped, setIsFlipped] = useState(true);
  function handleCardClick() {
    setIsFlipped((val) => !val); // flip
  }
  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={isFlipped ? styles.flipped : ""}>
        <div style={{ padding: "20px" }} className={styles.front}>
          <div className={styles.top}>Front</div>
          <div className={styles.middle}>{card.front}</div>
          {/* <div className={styles.bottom}>Buttons</div> */}
        </div>
        <div style={{ padding: "20px" }} className={styles.back}>
          <div className={styles.top}>Back</div>
          <div className={styles.middle}>{card.back}</div>
          {/* <div className={styles.bottom}>Buttons</div> */}
        </div>
      </div>
    </div>
  );
}
