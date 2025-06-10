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

  /**
   * Get daily review counts for a collection for the past year, grouped by week (latest week first), each with 7 days.
   * Each day is an object: { date: string, count: number }
   * Returns: Array<{ weekStart: string, days: { date: string, count: number }[] }>
   */
  const getCollectionReviewStats = async (collectionId: number) => {
    // Get today's date (local time)
    const today = new Date();
    //today.setHours(0, 0, 0, 0);
    // Find the start of the current week (Monday)
    const todayDayOfWeek = today.getDay();
    const dayOfWeek = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    console.warn(
      'DEBUG today',
      today.toISOString(),
      'today.getDay()',
      todayDayOfWeek,
      'dayOfWeek',
      dayOfWeek,
      'weekStart',
      weekStart.toISOString()
    );

    // Get the date 1 year ago from this week's start
    const yearAgo = new Date(weekStart);
    yearAgo.setDate(weekStart.getDate() - 7 * 52);

    // Query: join reviewLog and cards, filter by collectionId and createdAt >= yearAgo
    // Group by day (YYYY-MM-DD)
    // Debug: print a few reviewLog rows for this collection
    const debugRows = await db.getAllAsync<any>(
      `SELECT reviewLog.id, reviewLog.createdAt, reviewLog.cardId FROM reviewLog INNER JOIN cards ON reviewLog.cardId = cards.id WHERE cards.collectionId = ? ORDER BY reviewLog.createdAt DESC LIMIT 5`,
      collectionId
    );
    console.log('DEBUG reviewLog sample', debugRows);

    // Only consider rows with a valid createdAt (now as string)
    // Format yearAgo as 'YYYY-MM-DD 00:00:00'
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const yearAgoStr = `${yearAgo.getFullYear()}-${pad(yearAgo.getMonth() + 1)}-${pad(yearAgo.getDate())} 00:00:00`;
    const rows = await db.getAllAsync<{ date: string; count: number }>(
      `SELECT date(reviewLog.createdAt) as date, COUNT(*) as count
       FROM reviewLog
       INNER JOIN cards ON reviewLog.cardId = cards.id
       WHERE cards.collectionId = ? AND reviewLog.createdAt IS NOT NULL AND reviewLog.createdAt >= ?
       GROUP BY date
       ORDER BY date DESC`,
      collectionId,
      yearAgoStr
    );
    console.log('getCollectionReviewStats rows', rows);
    // Map: { date: string (YYYY-MM-DD), count: number }
    const countByDate: Record<string, number> = {};
    for (const row of rows) {
      countByDate[row.date] = row.count;
    }

    // Build weeks: from weekStart (Monday of this week) going back 52 weeks
    // For the current week, only include days up to today (no future days)
    const weeks: { weekStart: string; days: { date: string; count: number }[] }[] = [];
    // Determine today index in week (0=Monday, 6=Sunday)
    const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
    let weekStartCursor = new Date(weekStart); // don't mutate weekStart
    for (let w = 0; w < 52; w++) {
      const weekDays: { date: string; count: number }[] = [];
      for (let i = 0; i < 7; i++) {
        // For each day in the week, create a new date object
        const dayDate = new Date(weekStartCursor);
        dayDate.setDate(weekStartCursor.getDate() + i);
        const dateStr = dayDate.toISOString().slice(0, 10);
        // For the current week (w === 0), only include days up to and including today
        if (w === 0 && i > todayIdx) break;
        weekDays.push({ date: dateStr, count: countByDate[dateStr] || 0 });
      }
      if (weekDays.length > 0) {
        weeks.push({
          weekStart: weekDays[0].date, // first day is always Monday
          days: weekDays,
        });
      }
      // Move weekStartCursor back by 7 days for the next week
      weekStartCursor.setDate(weekStartCursor.getDate() - 7);
    }
    console.log(
      'DEBUG getCollectionReviewStats: weekStart',
      weekStart.toISOString().slice(0, 10),
      'today',
      today.toISOString().slice(0, 10)
    );
    console.log('DEBUG getCollectionReviewStats: weeks', JSON.stringify(weeks.slice(0, 3)));
    return weeks;
  };

  return {
    newReviewLog,
    getReviewLog,
    getCollectionReviewStats,
  };
}

export { ReviewLog, useReviewLogModel };
