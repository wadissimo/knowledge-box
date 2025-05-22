import * as SQLite from 'expo-sqlite';

enum SessionStatus {
  Started = 0,
  Completed = 1,
  Abandoned = -1,
}
type Session = {
  id: number;
  collectionId: number;
  trainingDate: string;
  newCards: number;
  reviewCards: number;
  learningCards: number;
  totalViews: number;
  successResponses: number;
  failedResponses: number;
  score: number;
  status: SessionStatus;
  createdAt?: number | null;
};

function useSessionModel() {
  const db = SQLite.useSQLiteContext();

  // Create

  const newSession = async (
    collectionId: number,
    trainingDate: string,
    newCards: number,
    reviewCards: number,
    learningCards: number = 0,
    totalViews: number = 0,
    successResponses: number = 0,
    failedResponses: number = 0,
    score: number = 0,
    status: number = 0
  ): Promise<number> => {
    const result = await db.runAsync(
      `INSERT INTO sessions (collectionId, trainingDate, newCards, reviewCards,
       learningCards, totalViews, successResponses, failedResponses, score, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      collectionId,
      trainingDate,
      newCards,
      reviewCards,
      learningCards,
      totalViews,
      successResponses,
      failedResponses,
      score,
      status
    );
    return result.lastInsertRowId;
  };

  //Update
  const updateSession = async (session: Session): Promise<void> => {
    await db.runAsync(
      `UPDATE sessions SET collectionId = ?, trainingDate = ?, newCards = ?,
       reviewCards = ?, learningCards = ?, totalViews = ?, successResponses= ?, 
       failedResponses = ?, score = ?, status = ? where id = ?`,
      session.collectionId,
      session.trainingDate,
      session.newCards,
      session.reviewCards,
      session.learningCards,
      session.totalViews,
      session.successResponses,
      session.failedResponses,
      session.score,
      session.status,
      session.id
    );
  };

  // Delete
  const deleteSession = async (sessionId: number) => {
    await db.runAsync('DELETE FROM sessions where id=?', sessionId);
  };

  // Read
  const getStartedSession = async (collectionId: number, dateString: string) => {
    const result = await db.getFirstAsync<Session | null>(
      'SELECT * FROM sessions where collectionId=? and trainingDate = ? and status = ?',
      collectionId,
      dateString,
      SessionStatus.Started
    );
    return result;
  };

  const getSessionsByCollectionId = async (
    collectionId: number,
    limit: number = 20
  ): Promise<Session[] | null> => {
    const result = await db.getAllAsync<Session>(
      'SELECT * FROM sessions where collectionId=? LIMIT ?',
      collectionId,
      limit
    );
    return result;
  };

  const getSessionById = async (sessionId: number) => {
    const result = await db.getFirstAsync<Session | null>(
      'SELECT * FROM sessions where id=?',
      sessionId
    );
    return result;
  };

  return {
    newSession,
    updateSession,
    deleteSession,
    getStartedSession,
    getSessionById,
    getSessionsByCollectionId,
  };
}

export { SessionStatus, Session, useSessionModel };
