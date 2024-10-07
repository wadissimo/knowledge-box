import * as SQLite from "expo-sqlite";

type Card = {
  id: number;
  front: string;
  back: string;
  collectionId: number;
  hide: Boolean;
  successfulRepeats: number;
  failedRepeats: number;
  repeatTime: number | null;
  prevRepeatTime: number | null;
  createdAt?: number | null;
  easeFactor: number | null;
  interval: number | null;
};

function useCardModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newCard = async (
    collectionId: number,
    front: string,
    back: string
  ): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)",
      collectionId,
      front,
      back
    );
    // const lastIdResult = await db.queryAsync("SELECT last_insert_rowid() AS id");
    await db.runAsync(
      "UPDATE collections set cardsNumber=(select count(*) from cards where collectionId=?) where id=?",
      collectionId,
      collectionId
    );
    return result.lastInsertRowId;
  };

  const newCards = async (
    cardList: { collectionId: number; front: string; back: string }[]
  ) => {
    let query = "INSERT INTO cards (collectionId, front, back) VALUES ";
    const values: any[] = [];
    cardList.forEach((card) => {
      query += "(?, ?, ?),";
      values.push(card.collectionId, card.front, card.back);
    });
    query = query.slice(0, -1); // Remove the trailing comma
    await db.withTransactionAsync(async () => {
      await db.runAsync(query, values);

      const collectionId = cardList[0].collectionId;
      await db.runAsync(
        "UPDATE collections set cardsNumber=(select count(*) from cards where collectionId=?) where id=?",
        collectionId,
        collectionId
      );
    });
  };

  // Update
  const updateCard = async (card: Card) => {
    await db.runAsync(
      `UPDATE cards SET front = ?, back = ?, collectionId = ?, hide = ?, successfulRepeats = ?, failedRepeats=?,
           repeatTime = ?, prevRepeatTime = ?, easeFactor = ?, interval = ?  where id = ?`,
      card.front,
      card.back,
      card.collectionId,
      card.hide ? 1 : 0,
      card.successfulRepeats,
      card.failedRepeats,
      card.repeatTime,
      card.prevRepeatTime,
      card.easeFactor,
      card.interval,
      card.id
    );
  };

  const updateCardFrontBack = async (
    cardId: number,
    front: string,
    back: string
  ) => {
    await db.runAsync(
      "UPDATE cards SET front = ?, back = ? where id=?",
      front,
      back,
      cardId
    );
  };

  // Delete
  const deleteCard = async (cardId: number) => {
    //TODO: remove
    const card = await getCardById(cardId);
    await db.runAsync("DELETE FROM cards where id=?", cardId);
    // Update card number
    if (card) {
      const collectionId = card.collectionId;
      await db.runAsync(
        "UPDATE collections set cardsNumber=(select count(*) from cards where collectionId=?) where id=?",
        collectionId,
        collectionId
      );
    }
  };

  // Read

  const getCards = async (collectionId: number) => {
    const result = await db.getAllAsync<Card>(
      "SELECT * FROM cards where collectionId=? ",
      collectionId
    );
    return result;
  };

  const getCardById = async (cardId: number) => {
    const result = await db.getFirstAsync<Card>(
      "SELECT * FROM cards where id=? ",
      cardId
    );
    return result;
  };
  return {
    newCard,
    newCards,
    updateCard,
    updateCardFrontBack,
    deleteCard,
    getCards,
    getCardById,
  };
}

export { Card, useCardModel };
