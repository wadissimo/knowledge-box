import * as SQLite from "expo-sqlite";
import { Card } from "./CardModel";

enum SessionCardStatus {
  New = 0, // unseen in the session
  Learning = 1, // learning in progress
  Complete = 2, // learning done
}
type SessionCard = {
  sessionId: number;
  cardId: number;
  status: SessionCardStatus;
  successfulRepeats: number;
  failedRepeats: number;
};

function useSessionCardModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newSessionCard = async (
    sessionId: number,
    cardId: number,
    status: SessionCardStatus = SessionCardStatus.New,
    successfulRepeats: number = 0,
    failedRepeats: number = 0
  ): Promise<void> => {
    await db.runAsync(
      `INSERT INTO sessionCards (sessionId, cardId, status,successfulRepeats, failedRepeats) 
      VALUES (?, ?, ?, ?, ?)`,
      sessionId,
      cardId,
      status,
      successfulRepeats,
      failedRepeats
    );
  };

  // Update
  const updateSessionCard = async (sessionCard: SessionCard): Promise<void> => {
    await db.runAsync(
      "UPDATE sessionCards SET status = ?, successfulRepeats = ?, failedRepeats = ? where sessionId = ? and cardId = ?",
      sessionCard.status,
      sessionCard.successfulRepeats,
      sessionCard.failedRepeats,
      sessionCard.sessionId,
      sessionCard.cardId
    );
  };
  // Mark SessionCard as completed
  const completeSessionCard = async (
    sessionId: number,
    cardId: number
  ): Promise<void> => {
    await db.runAsync(
      "UPDATE sessionCards SET status = ? where sessionId = ? and cardId = ?",
      SessionCardStatus.Complete,
      sessionId,
      cardId
    );
  };

  // Delete
  const deleteSessionCard = async (
    sessionId: number,
    cardId: number
  ): Promise<void> => {
    await db.runAsync(
      "DELETE FROM sessionCards where sessionId = ? and cardId = ?",
      sessionId,
      cardId
    );
  };

  // Read

  const getSessionCard = async (
    sessionId: number,
    cardId: number
  ): Promise<SessionCard | null> => {
    return await db.getFirstAsync(
      "SELECT * FROM sessionCards where sessionId = ? and cardId = ?",
      sessionId,
      cardId
    );
  };

  return {
    newSessionCard,
    updateSessionCard,
    completeSessionCard,
    deleteSessionCard,
    getSessionCard,
  };
}

export { SessionCardStatus, SessionCard, useSessionCardModel };
