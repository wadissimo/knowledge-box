import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import * as SQLite from "expo-sqlite";

// Define Collection type
type Collection = {
  id: number;
  name: string;
  cardsNumber: number;
  createdAt: number;
};

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

type Session = {
  id: number;
  collectionId: number;
  trainingDate: string;
  newCards: number;
  repeatCards: number;
  createdAt?: number | null;
};

type SessionCard = {
  sessionId: number;
  cardId: number;
  type: string;
  status: string;
  sessionOrder: number | null;
  successfulRepeats: number;
  createdAt?: number | null;
  card?: Card | null;
};

interface CollectionContextProps {
  collections: Collection[];

  updateCardRepeatTime: Function;
  selectNewTrainingCards: Function;
  selectToRepeatTrainingCards: Function;
  getSession: Function;
  getSessionCards: Function;
  createSession: Function;
  createSessionCard: Function;
  removeSession: Function;
  updateSessionCard: Function;

  removeSessionCard: Function;
}

const CollectionContext = createContext<CollectionContextProps>({
  collections: [],

  updateCardRepeatTime: () => {},
  selectNewTrainingCards: () => {},
  selectToRepeatTrainingCards: () => {},
  getSession: () => {},
  getSessionCards: () => {},
  createSession: () => {},
  createSessionCard: () => {},
  removeSession: () => {},
  updateSessionCard: () => {},

  removeSessionCard: () => {},
});

interface CollectionProviderProps {
  children: ReactNode;
}

const CollectionProvider = ({ children }: CollectionProviderProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const db = SQLite.useSQLiteContext();
  // const collections = [
  //   { id: "1", name: "Math", cardsNumber: 20 },
  //   { id: "2", name: "History", cardsNumber: 30 },
  // ];
  //const [collections, setCollections] = useState<Collection[]>([]);

  const fetchCollections = async () => {
    const result = await db.getAllAsync<Collection>(
      "SELECT * FROM collections"
    );
    setCollections(result);
  };

  const newCollection = async (name: string) => {
    await db.runAsync(
      "INSERT INTO collections (name, cardsNumber) VALUES (?, ?)",
      name,
      0
    );
    await fetchCollections();
  };

  const updateCollection = async (id: number, name: string) => {
    await db.runAsync("UPDATE collections SET name = ? where id=?", name, id);
    await fetchCollections();
  };

  const deleteCollection = async (id: number) => {
    await db.runAsync("DELETE FROM collections where id=?", id);
    await fetchCollections();
  };

  const getCollectionById = async (id: number) => {
    const result = await db.getAllAsync<Collection>(
      "SELECT * FROM collections where id=? ",
      id
    );
    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  };

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

  const newCard = async (collectionId: number, front: string, back: string) => {
    await db.runAsync(
      "INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)",
      collectionId,
      front,
      back
    );

    await db.runAsync(
      "UPDATE collections set cardsNumber=(select count(*) from cards where collectionId=?) where id=?",
      collectionId,
      collectionId
    );

    //todo update collection count
    await fetchCollections();
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
    await fetchCollections();
  };

  const updateCardRepeatTime = async (cardId: number, repeatTime: string) => {
    await db.runAsync(
      "UPDATE cards SET repeatTime = ? where id=?",
      repeatTime,
      cardId
    );
  };

  const deleteCard = async (cardId: number) => {
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
    await fetchCollections();
  };

  const selectNewTrainingCards = async (
    collectionId: number,
    numberOfCards: number
  ) => {
    const result = await db.getAllAsync<Card>(
      "SELECT * FROM cards where collectionId=? and repeatTime is null order by id asc limit ?",
      collectionId,
      numberOfCards
    );
    return result;
  };

  const selectToRepeatTrainingCards = async (
    collectionId: number,
    time: number
  ) => {
    const result = await db.getAllAsync<Card>(
      "SELECT * FROM cards where collectionId = ? and repeatTime <= ?",
      collectionId,
      time
    );

    return result;
  };

  const getSession = async (collectionId: number, dateString: string) => {
    const result = await db.getFirstAsync<Session | null>(
      "SELECT * FROM sessions where collectionId=? and trainingDate = ?",
      collectionId,
      dateString
    );
    return result;
  };

  const getSessionCards = async (sessionId: number) => {
    const cards = await db.getAllAsync<Card>(
      "SELECT * FROM cards inner join sessionCards on cards.id = sessionCards.cardId where sessionCards.sessionId=?",
      sessionId
    );
    const cardMap = new Map();
    cards.forEach((card) => {
      cardMap.set(card.id, card);
    });

    const sessionCards = await db.getAllAsync<SessionCard>(
      "SELECT * FROM sessionCards where sessionId=? order by sessionOrder",
      sessionId
    );
    sessionCards.forEach((sessionCard) => {
      sessionCard.card = cardMap.get(sessionCard.cardId);
    });
    return sessionCards;
  };

  const createSession = async (session: Session) => {
    await db.runAsync(
      "INSERT INTO sessions (collectionId, trainingDate, newCards, repeatCards) VALUES (?, ?, ?, ?)",
      session.collectionId,
      session.trainingDate,
      session.newCards,
      session.repeatCards
    );
  };

  const createSessionCard = async (sessionCard: SessionCard) => {
    await db.runAsync(
      "INSERT INTO sessionCards (sessionId, cardId, type, status, sessionOrder) VALUES (?, ?, ?, ?, ?)",
      sessionCard.sessionId,
      sessionCard.cardId,
      sessionCard.type,
      sessionCard.status,
      sessionCard.sessionOrder
    );
  };

  const removeSession = async (sessionId: number) => {
    await db.runAsync("DELETE FROM sessions where id=?", sessionId);
  };

  const updateSessionCard = async (sessionCard: SessionCard) => {
    await db.runAsync(
      "UPDATE sessionCards SET type = ?, status = ?, sessionOrder = ?, successfulRepeats = ? where sessionId = ? and cardId = ?",
      sessionCard.type,
      sessionCard.status,
      sessionCard.sessionOrder,
      sessionCard.successfulRepeats,
      sessionCard.sessionId,
      sessionCard.cardId
    );
  };

  const removeSessionCard = async (sessionId: number, cardId: number) => {
    await db.runAsync(
      "DELETE FROM sessionCards where sessionId = ? and cardId = ?",
      sessionId,
      cardId
    );
  };

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

  return (
    <CollectionContext.Provider
      value={{
        collections,

        updateCardRepeatTime,
        selectNewTrainingCards,
        selectToRepeatTrainingCards,
        getSession,
        getSessionCards,
        createSession,
        createSessionCard,
        removeSession,
        updateSessionCard,

        removeSessionCard,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

function useDatabase() {
  const context = useContext(CollectionContext);
  return context;
}

export {
  CollectionProvider,
  useDatabase,
  Collection,
  CollectionContextProps,
  Card,
  Session,
  SessionCard,
};