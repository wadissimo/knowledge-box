import * as SQLite from 'expo-sqlite';
import { Card, CardStatus } from '../data/CardModel';
import { SessionCard, SessionCardStatus, useSessionCardModel } from '../data/SessionCardModel';
import { getTodayAsNumber, getTomorrowAsNumber } from '../lib/TimeUtils';
import { useSessionModel } from '../data/SessionModel';
import { useCollectionModel } from '../data/CollectionModel';

export type TodayStudyCardsCount = {
  reviewCardCount: number;
  newCardCount: number;
  learningCardCount: number;
};
function useCardTrainingService() {
  const db = SQLite.useSQLiteContext();
  const sessionCardModel = useSessionCardModel();
  const sessionModel = useSessionModel();
  const collectionModel = useCollectionModel();

  const updateCardRepeatTime = async (cardId: number, repeatTime: number | null) => {
    await db.runAsync('UPDATE cards SET repeatTime = ? where id=?', repeatTime, cardId);
  };

  const selectNewTrainingCards = async (collectionId: number, maxCards: number) => {
    const result = await db.getAllAsync<Card>( // TODO: is it better to use status = 0?
      'SELECT * FROM cards where collectionId=? and (status = ? or status is null) order by priority, id asc limit ?',
      collectionId,
      CardStatus.New,
      maxCards
    );
    return result;
  };

  const selectReviewCards = async (
    collectionId: number,
    time: number, // time as ms number
    maxCards: number
  ) => {
    const result = await db.getAllAsync<Card>(
      'SELECT * FROM cards where collectionId = ? and repeatTime <= ? and status = ? order by repeatTime limit ?',
      collectionId,
      time,
      CardStatus.Review,
      maxCards
    );
    return result;
  };

  const selectLearningCards = async (collectionId: number, maxCards: number) => {
    const result = await db.getAllAsync<Card>(
      'SELECT * FROM cards where collectionId = ? and status = ? order by repeatTime limit ?',
      collectionId,
      CardStatus.Learning,
      maxCards
    );
    return result;
  };

  const selectLearningAndRelearningCards = async (collectionId: number, maxCards: number) => {
    const result = await db.getAllAsync<Card>(
      'SELECT * FROM cards where collectionId = ? and (status = ? or status = ?) order by repeatTime limit ?',
      collectionId,
      CardStatus.Learning,
      CardStatus.Relearning,
      maxCards
    );
    return result;
  };

  const bulkUpdateRepeatTime = async (cards: Card[]): Promise<void> => {
    await Promise.all(cards.map(card => updateCardRepeatTime(card.id, card.repeatTime))).catch(
      e => {
        console.log('bulkUpdateRepeatTime error', e);
      }
    );
  };

  const bulkInsertTrainingCards = async (sessionCards: SessionCard[]): Promise<void> => {
    await db.withTransactionAsync(async () => {
      await Promise.all(
        sessionCards.map(card =>
          sessionCardModel.newSessionCard(
            card.sessionId,
            card.cardId,
            card.status,
            card.successfulRepeats,
            card.failedRepeats,
            card.plannedReviewTime
          )
        )
      ).catch(e => {
        console.error('bulkInsertTrainingCards error', e);
        throw e;
      });
    });
  };

  const getNextCard = async (sessionId: number): Promise<Card | null> => {
    return await db.getFirstAsync(
      'SELECT cards.* from cards inner join sessionCards on cards.id=sessionCards.cardId where sessionCards.sessionId = ? and sessionCards.status <> ? order by cards.repeatTime, cards.id',
      sessionId,
      SessionCardStatus.Complete
    );
  };

  const getAllSessionCards = async (sessionId: number): Promise<Card[]> => {
    return await db.getAllAsync<Card>(
      'SELECT cards.* from cards inner join sessionCards on cards.id=sessionCards.cardId where sessionCards.sessionId = ? order by cards.repeatTime, cards.id',
      sessionId
    );
  };

  const getSessionCardsCount = async (sessionId: number): Promise<number> => {
    const res = await db.getFirstAsync<{ 'COUNT(*)': number }>(
      'SELECT COUNT(*) from sessionCards where sessionId = ?',
      sessionId
    );
    return res?.['COUNT(*)'] ?? 0;
  };

  const getCurrentSessionCards = async (sessionId: number): Promise<SessionCard[]> => {
    const sessionCards = await db.getAllAsync<SessionCard>(
      'SELECT * FROM sessionCards inner join cards on cards.id = sessionCards.cardId where sessionCards.sessionId=? and sessionCards.status <> ? order by cards.repeatTime',
      sessionId,
      SessionCardStatus.Complete
    );

    return sessionCards;
  };

  const getCurrentCards = async (sessionId: number): Promise<Card[]> => {
    return await db.getAllAsync<Card>(
      'SELECT cards.* from cards inner join sessionCards on cards.id=sessionCards.cardId where sessionCards.sessionId = ? and sessionCards.status <> ? order by cards.repeatTime, cards.id',
      sessionId,
      SessionCardStatus.Complete
    );
  };

  const getCurrentCardsCount = async (sessionId: number): Promise<number> => {
    const res = await db.getFirstAsync<{ 'COUNT(*)': number }>(
      'SELECT COUNT(*) from cards inner join sessionCards on cards.id=sessionCards.cardId where sessionCards.sessionId = ? and sessionCards.status <> ? order by cards.repeatTime, cards.id',
      sessionId,
      SessionCardStatus.Complete
    );

    return res?.['COUNT(*)'] ?? 0;
  };

  const getTodayStudyCardsCount = async (collectionId: number): Promise<TodayStudyCardsCount> => {
    const today = getTodayAsNumber();
    const tomorrow = getTomorrowAsNumber();

    const startedSession = await sessionModel.getStartedSession(collectionId, today.toString());
    if (startedSession) {
      return {
        reviewCardCount: startedSession.reviewCards,
        newCardCount: startedSession.newCards,
        learningCardCount: startedSession.learningCards,
      };
    }

    const reviewCardCountRes = await db.getFirstAsync<{ 'COUNT(*)': number }>(
      'SELECT COUNT(*) from cards where collectionId = ? and repeatTime <= ? and status = ?',
      collectionId,
      tomorrow,
      CardStatus.Review
    );
    const reviewCardCount = reviewCardCountRes?.['COUNT(*)'] ?? 0;

    const learningCardCountRes = await db.getFirstAsync<{ 'COUNT(*)': number }>(
      'SELECT COUNT(*) from cards where collectionId = ? and repeatTime <= ? and (status = ? or status = ?)',
      collectionId,
      tomorrow,
      CardStatus.Learning,
      CardStatus.Relearning
    );
    const learningCardCount = learningCardCountRes?.['COUNT(*)'] ?? 0;

    const collectionTrainingData = await collectionModel.getCollectionTrainingData(collectionId);
    const maxNewCards = collectionTrainingData?.maxNewCards ?? 0;

    return {
      reviewCardCount,
      learningCardCount,
      newCardCount: maxNewCards,
    };
  };

  return {
    updateCardRepeatTime,
    selectNewTrainingCards,
    selectReviewCards,
    selectLearningCards,
    bulkUpdateRepeatTime,
    bulkInsertTrainingCards,
    getNextCard,
    getAllSessionCards,
    getSessionCardsCount,
    getCurrentSessionCards,
    getCurrentCards,
    getCurrentCardsCount,

    selectLearningAndRelearningCards,
    getTodayStudyCardsCount,
  };
}

export { useCardTrainingService };
