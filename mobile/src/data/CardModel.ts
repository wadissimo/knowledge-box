import * as SQLite from 'expo-sqlite';

enum CardStatus {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
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
  initialEaseFactor: number;
  hide: Boolean;
  repeatTime: number | null;
  prevRepeatTime: number | null;
  successfulRepeats: number;
  failedRepeats: number;
  interval: number;
  easeFactor: number;
  createdAt?: number;
  status: CardStatus;
  priority: number;
  //FSRS
  stability: number;
  difficulty: number;
  learningStep: number;
  lastReviewTime: number;
};

function useCardModel() {
  const db = SQLite.useSQLiteContext();

  const newCard = async (collectionId: number, front: string, back: string): Promise<number> => {
    const result = await db.runAsync(
      'INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)',
      collectionId,
      front,
      back
    );
    // const lastIdResult = await db.queryAsync("SELECT last_insert_rowid() AS id");
    await db.runAsync(
      'UPDATE collections set cardsNumber=(select count(*) from cards where collectionId=?) where id=?',
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
      'INSERT INTO cards (collectionId, front, back, frontImg, backImg, frontSound, backSound, initialEaseFactor) VALUES ';
    const values: any[] = [];
    cardList.forEach(card => {
      query += '(?, ?, ?, ?, ?, ?, ?, ?),';
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
        'UPDATE collections set cardsNumber=(select count(*) from cards where collectionId=?) where id=?',
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
           easeFactor = ?, status = ?, priority = ?, stability = ?, difficulty = ?,
           learningStep = ?, lastReviewTime = ?
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
      card.stability,
      card.difficulty,
      card.learningStep,
      card.lastReviewTime,
      card.id
    );
  };

  const updateCardFrontBack = async (cardId: number, front: string, back: string) => {
    await db.runAsync('UPDATE cards SET front = ?, back = ? where id=?', front, back, cardId);
  };

  // Delete
  const deleteCard = async (cardId: number) => {
    //TODO: remove
    const card = await getCardById(cardId);
    await db.runAsync('DELETE FROM cards where id=?', cardId);
    // Update card number
    if (card) {
      const collectionId = card.collectionId;
      await db.runAsync(
        'UPDATE collections set cardsNumber=(select count(*) from cards where collectionId=?) where id=?',
        collectionId,
        collectionId
      );
    }
  };

  // Read

  const getCards = async (collectionId: number) => {
    const result = await db.getAllAsync<Card>(
      'SELECT * FROM cards where collectionId=? ',
      collectionId
    );
    return result;
  };

  const getPreviewCards = async (collectionId: number, limit: number = 5): Promise<Card[]> => {
    const result = await db.getAllAsync<Card>(
      'SELECT * FROM cards WHERE collectionId=? LIMIT ?',
      collectionId,
      limit
    );
    return result;
  };

  const getCardById = async (cardId: number) => {
    const result = await db.getFirstAsync<Card>('SELECT * FROM cards where id=? ', cardId);
    return result;
  };

  const getCardCountByStatus = async (
    collectionId: number,
    status: CardStatus
  ): Promise<number> => {
    const res = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM cards where collectionId=? and status=?',
      collectionId,
      status
    );

    if (res === null || res?.cnt === null) {
      console.error('getCardCountByStatus, res', res);
      throw new Error('getCardCountByStatus unexpected null result');
    }

    return res.cnt;
  };

  const learnCardLater = async (card: Card): Promise<void> => {
    await db.runAsync(
      `UPDATE cards SET status=?, repeatTime=?,
       priority=(SELECT MAX(priority) from cards where collectionId=?)+1
       WHERE id = ?`,
      CardStatus.New,
      null,
      card.collectionId,
      card.id
    );
  };

  // Search for duplicate card by front or back in a collection
  const isDuplicateCard = async (
    collectionId: number,
    front: string,
    back: string
  ): Promise<boolean> => {
    const result = await db.getFirstAsync<Card>(
      'SELECT * FROM cards WHERE collectionId = ? AND (front = ? OR back = ?)',
      collectionId,
      front,
      back
    );
    return !!result;
  };

  /**
   * Returns a window of cards for a collection, given an offset and limit.
   * Use this to implement paged or windowed browsing for cards in a collection.
   */
  const getCardsWindow = async (
    collectionId: number,
    offset: number = 0,
    limit: number = 5
  ): Promise<Card[]> => {
    const result = await db.getAllAsync<Card>(
      'SELECT * FROM cards WHERE collectionId=? ORDER BY id LIMIT ? OFFSET ?',
      collectionId,
      limit,
      offset
    );
    return result;
  };

  /**
   * Returns the total number of cards in a collection.
   */
  const getCardsCount = async (collectionId: number): Promise<number> => {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM cards WHERE collectionId=?',
      collectionId
    );
    return result?.count ?? 0;
  };

  return {
    newCard,
    newCards,
    updateCard,
    updateCardFrontBack,
    deleteCard,
    getCards,
    getPreviewCards,
    getCardById,
    getCardCountByStatus,
    learnCardLater,
    isDuplicateCard,
    getCardsWindow,
    getCardsCount,
  };
}

export { CardStatus, Card, useCardModel };
