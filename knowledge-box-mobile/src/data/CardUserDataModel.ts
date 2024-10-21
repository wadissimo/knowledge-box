import * as SQLite from "expo-sqlite";

type CardUserData = {
  cardId: number;
  hide: Boolean;
  repeatTime: number | null;
  prevRepeatTime: number | null;
  successfulRepeats: number | null;
  failedRepeats: number | null;
  interval: number | null;
  easeFactor: number | null;
};

function useCardUserDataModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newCardUserData = async (cardId: number): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO cardUserData (cardId) VALUES (?)",
      cardId
    );
    return result.lastInsertRowId;
  };

  // Update
  const updateCardUserData = async (cardUserData: CardUserData) => {
    await db.runAsync(
      `UPDATE cardUserData SET hide = ?, repeatTime = ?, prevRepeatTime = ?, successfulRepeats = ?, failedRepeats = ?, interval=?,
           easeFactor = ? where id = ?`,
      cardUserData.hide ? 1 : 0,
      cardUserData.repeatTime,
      cardUserData.prevRepeatTime,
      cardUserData.successfulRepeats,
      cardUserData.failedRepeats,
      cardUserData.interval,
      cardUserData.easeFactor,
      cardUserData.cardId
    );
  };

  // Delete
  const deleteCardUserData = async (cardId: number) => {
    //TODO: remove
    await db.runAsync("DELETE FROM cardUserData where id=?", cardId);
  };

  return {
    newCardUserData,

    updateCardUserData,

    deleteCardUserData,
  };
}

export { CardUserData, useCardUserDataModel };
