import React, { useState } from "react";

import styles from "./Card.module.css";

function formatTimestamp(timestamp, locale = "en-GB") {
  const date = new Date(timestamp); // Convert the timestamp to a Date object

  const options = {
    weekday: "long", // e.g., Monday
    year: "numeric", // e.g., 2024
    month: "long", // e.g., September
    day: "numeric", // e.g., 25
    hour: "2-digit", // e.g., 08
    minute: "2-digit", // e.g., 05
    second: "2-digit", // optional
    hour12: false, // 24-hour time format
  };

  return date.toLocaleString(locale, options);
}

export default function Card({ card, debug = false }) {
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
          {debug && (
            <div className={styles.middle}>
              {card.repeatTime
                ? formatTimestamp(card.repeatTime)
                : "Not Started"}
            </div>
          )}

          {/* <div className={styles.bottom}>Buttons</div> */}
        </div>
        <div style={{ padding: "20px" }} className={styles.back}>
          <div className={styles.top}>Back</div>
          <div className={styles.middle}>{card.back}</div>
          {debug && (
            <div className={styles.middle}>
              {card.repeatTime
                ? formatTimestamp(card.repeatTime)
                : "Not Started"}
            </div>
          )}
          {/* <div className={styles.bottom}>Buttons</div> */}
        </div>
      </div>
    </div>
  );
}
