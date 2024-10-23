import * as SQLite from "expo-sqlite";
import { Card } from "./CardModel";

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

function useSessionCardModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newSessionCard = async (sessionId: number, cardId: number) => {
    await db.runAsync(
      "INSERT INTO sessionCards (sessionId, cardId) VALUES (?, ?)",
      sessionId,
      cardId
    );
  };

  // Update
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

  // Delete
  const deleteSessionCard = async (sessionId: number, cardId: number) => {
    await db.runAsync(
      "DELETE FROM sessionCards where sessionId = ? and cardId = ?",
      sessionId,
      cardId
    );
  };

  // Read
  const getSessionCards = async (sessionId: number) => {
    const cards = await db.getAllAsync<Card>(
      "SELECT * FROM cards inner join sessionCards on cards.id = sessionCards.cardId where sessionCards.sessionId=? order by cards.repeatTime",
      sessionId
    );
    const cardMap = new Map();
    cards.forEach((card) => {
      cardMap.set(card.id, card);
    });

    const sessionCards = await db.getAllAsync<SessionCard>(
      "SELECT * FROM sessionCards inner join cards on cards.id = sessionCards.cardId where sessionCards.sessionId=? order by cards.repeatTime",
      sessionId
    );
    sessionCards.forEach((sessionCard) => {
      sessionCard.card = cardMap.get(sessionCard.cardId);
    });
    return sessionCards;
  };

  return {
    newSessionCard,
    updateSessionCard,
    deleteSessionCard,
    getSessionCards,
  };
}

export { SessionCard, useSessionCardModel };
