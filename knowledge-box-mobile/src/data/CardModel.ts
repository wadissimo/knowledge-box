import * as SQLite from "expo-sqlite";

enum CardStatus {
  New = 0,
  Learning = 1,
  Review = 2,
}

type Card = {
  id: number;
  front: string;
  back: string;
  collectionId: number;
  frontImg: number | null;
  backImg: number | null;
  frontSound: number | null;
  backSound: number | null;
  initialEaseFactor: number | null;
  hide: Boolean;
  repeatTime: number | null;
  prevRepeatTime: number | null;
  successfulRepeats: number | null;
  failedRepeats: number | null;
  interval: number | null;
  easeFactor: number | null;
  createdAt?: number | null;
  status: CardStatus | null;
  priority: number | null;
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
    cardList: {
      collectionId: number;
      front: string;
      back: string;
      frontImg: number | null;
      backImg: number | null;
      frontSound: number | null;
      backSound: number | null;
      initialEaseFactor: number | null;
    }[]
  ) => {
    let query =
      "INSERT INTO cards (collectionId, front, back, frontImg, backImg, frontSound, backSound, initialEaseFactor) VALUES ";
    const values: any[] = [];
    cardList.forEach((card) => {
      query += "(?, ?, ?, ?, ?, ?, ?, ?),";
      values.push(
        card.collectionId,
        card.front,
        card.back,
        card.frontImg,
        card.backImg,
        card.frontSound,
        card.backSound,
        card.initialEaseFactor
      );
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
      `UPDATE cards SET front = ?, back = ?, collectionId = ?, frontImg = ?, backImg = ?, 
           frontSound=?, backSound = ?, initialEaseFactor = ?, hide = ?, repeatTime = ?,
            prevRepeatTime = ?, successfulRepeats = ?, failedRepeats = ?, interval=?,
           easeFactor = ?, status = ?, priority = ?
           where id = ?`,
      card.front,
      card.back,
      card.collectionId,
      card.frontImg,
      card.backImg,
      card.frontSound,
      card.backSound,
      card.initialEaseFactor,
      card.hide ? 1 : 0,
      card.repeatTime,
      card.prevRepeatTime,
      card.successfulRepeats,
      card.failedRepeats,
      card.interval,
      card.easeFactor,
      card.status,
      card.priority,
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

  const getCardCountByStatus = async (
    collectionId: number,
    status: CardStatus
  ): Promise<number> => {
    const res = await db.getFirstAsync<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM cards where collectionId=? and status=?",
      collectionId,
      status
    );

    if (res === null || res?.cnt === null) {
      console.error("getCardCountByStatus, res", res);
      throw new Error("getCardCountByStatus unexpected null result");
    }

    return res.cnt;
  };
  return {
    newCard,
    newCards,
    updateCard,
    updateCardFrontBack,
    deleteCard,
    getCards,
    getCardById,
    getCardCountByStatus,
  };
}

export { CardStatus, Card, useCardModel };
