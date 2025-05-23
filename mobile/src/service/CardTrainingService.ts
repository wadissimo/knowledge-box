import * as SQLite from 'expo-sqlite';
import { Card, CardStatus } from '../data/CardModel';
import { SessionCard, SessionCardStatus, useSessionCardModel } from '../data/SessionCardModel';

function useCardTrainingService() {
  const db = SQLite.useSQLiteContext();
  const sessionCardModel = useSessionCardModel();

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

  const bulkUpdateRepeatTime = async (cards: Card[]): Promise<void> => {
    await Promise.all(cards.map(card => updateCardRepeatTime(card.id, card.repeatTime))).catch(
      e => {
        console.log('bulkUpdateRepeatTime error', e);
      }
    );
  };

  const bulkInsertTrainingCards = async (sessionId: number, cards: Card[]): Promise<void> => {
    await Promise.all(cards.map(card => sessionCardModel.newSessionCard(sessionId, card.id)));
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

  const countSessionCards = async (sessionId: number): Promise<number> => {
    const res = await db.getFirstAsync<number>(
      'SELECT COUNT(*) from sessionCards where sessionId = ?',
      sessionId
    );
    return res ?? 0;
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

  return {
    updateCardRepeatTime,
    selectNewTrainingCards,
    selectReviewCards,
    selectLearningCards,
    bulkUpdateRepeatTime,
    bulkInsertTrainingCards,
    getNextCard,
    getAllSessionCards,
    countSessionCards,
    getCurrentSessionCards,
    getCurrentCards,
  };
}

export { useCardTrainingService };
