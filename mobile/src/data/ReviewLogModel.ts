import * as SQLite from 'expo-sqlite';

type ReviewLog = {
  id: number;
  cardId: number;
  cardState: number;
  reviewDuration: number;
  scheduledReviewTime: number;
  grade: number;
  stability: number;
  difficulty: number;
  createdAt?: number;
};

function useReviewLogModel() {
  const db = SQLite.useSQLiteContext();

  const newReviewLog = async (
    cardId: number,
    cardState: number,
    reviewDuration: number,
    scheduledReviewTime: number,
    grade: number,
    stability: number,
    difficulty: number
  ) => {
    await db.runAsync(
      'INSERT INTO reviewLog (cardId, cardState, reviewDuration, scheduledReviewTime, grade, stability, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
      cardId,
      cardState,
      reviewDuration,
      scheduledReviewTime,
      grade,
      stability,
      difficulty
    );
  };

  const getReviewLog = async (cardId: number) => {
    const result = await db.getAllAsync<ReviewLog>(
      'SELECT * FROM reviewLog where cardId=? order by createdAt desc',
      cardId
    );
    return result;
  };

  return {
    newReviewLog,
    getReviewLog,
  };
}

export { ReviewLog, useReviewLogModel };
