import * as SQLite from "expo-sqlite";

type Session = {
  id: number;
  collectionId: number;
  trainingDate: string;
  newCards: number;
  repeatCards: number;
  createdAt?: number | null;
};

function useSessionModel() {
  const db = SQLite.useSQLiteContext();

  // Create

  const newSession = async (session: Session) => {
    await db.runAsync(
      "INSERT INTO sessions (collectionId, trainingDate, newCards, repeatCards) VALUES (?, ?, ?, ?)",
      session.collectionId,
      session.trainingDate,
      session.newCards,
      session.repeatCards
    );
  };

  // Delete
  const deleteSession = async (sessionId: number) => {
    await db.runAsync("DELETE FROM sessions where id=?", sessionId);
  };

  // Read
  const getSession = async (collectionId: number, dateString: string) => {
    const result = await db.getFirstAsync<Session | null>(
      "SELECT * FROM sessions where collectionId=? and trainingDate = ?",
      collectionId,
      dateString
    );
    return result;
  };

  return {
    newSession,
    deleteSession,
    getSession,
  };
}

export { Session, useSessionModel };
