import { useEffect, useState } from 'react';
import { Session, SessionStatus, useSessionModel } from '../data/SessionModel';
import { CollectionTrainingData, useCollectionModel } from '../data/CollectionModel';
import {
  getTodayAsNumber,
  getTomorrowAsNumber,
  getYesterdayAsNumber,
  ONE_DAY,
  stripTimeFromDate,
} from '../lib/TimeUtils';
import { SessionCardStatus, useSessionCardModel } from '../data/SessionCardModel';
import { useCardModel } from '../data/CardModel';
import { useReviewLogModel } from '../data/ReviewLogModel';
import { useCardTrainingService } from './CardTrainingService';

export default function useSessionTrainingLogic(collectionId: number | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [trainingData, setTrainingData] = useState<CollectionTrainingData | null>(null);

  const { getCollectionById, getCollectionTrainingData, updateCollectionTrainingData } =
    useCollectionModel();
  const { deleteSessionCard, getSessionCard, updateSessionCard } = useSessionCardModel();
  const { learnCardLater, updateCard } = useCardModel();
  const { updateSession, newSession, getSessionById, getStartedSession } = useSessionModel();
  const { newReviewLog } = useReviewLogModel();
  const {
    selectNewTrainingCards,
    selectReviewCards,
    selectLearningCards,
    bulkInsertTrainingCards,
    bulkUpdateRepeatTime,
    getNextCard: getNextCardDb,
    getAllSessionCards,
    selectLearningAndRelearningCards,
  } = useCardTrainingService();

  async function createSession(
    key: string,
    collectionId: number,
    trainingData: CollectionTrainingData
  ): Promise<Session> {
    // console.log('useSessionTrainingLogic: create session', collectionId, trainingData);
    if (collectionId === null) throw new Error('useSessionTrainingLogic: collection ID is null');
    if (trainingData === null) {
      console.error('useSessionTrainingLogic: training data is null!');
      throw new Error('useSessionTrainingLogic: training data is null');
    }
    try {
      // Select cards
      //   console.log('useSessionTrainingLogic: select learning cards');
      var cardsToLearn = await selectLearningAndRelearningCards(
        collectionId,
        trainingData.maxLearningCards
      );
      //   console.log('useSessionTrainingLogic: select learning cards done', cardsToLearn.length);
      //   console.log('useSessionTrainingLogic: select new cards');
      var newCards = await selectNewTrainingCards(
        collectionId,
        Math.max(0, trainingData.maxNewCards)
      );
      //   console.log('useSessionTrainingLogic: select new cards done', newCards.length);
      const cutOffTime = getTomorrowAsNumber() - 1;
      console.log(
        'useSessionTrainingLogic: select review cards, cutoff time',
        new Date(cutOffTime)
      );
      var cardsToReview = await selectReviewCards(
        collectionId,
        cutOffTime,
        trainingData.maxReviewCards
      );
      // console.log('useSessionTrainingLogic: select review cards done', cardsToReview.length);
      // add more cards for review?
      if (cardsToReview.length < trainingData.maxReviewCards) {
        const remainingCards = trainingData.maxReviewCards - cardsToReview.length;
        const additionalCards = await selectReviewCards(
          collectionId,
          cutOffTime + ONE_DAY,
          remainingCards
        );
        cardsToReview = cardsToReview.concat(additionalCards);
      }

      //   console.log('useSessionTrainingLogic: create session');
      const sessionId = await newSession(
        collectionId,
        key,
        newCards.length,
        cardsToReview.length,
        cardsToLearn.length
      );
      //   console.log('useSessionTrainingLogic: session ID ', sessionId);
      const session = await getSessionById(sessionId);
      if (session === null) {
        throw new Error('useSessionTrainingLogic: Session not found.');
      }
      setSession(session);
      //   console.log('useSessionTrainingLogic: bulk update');

      const allCards = [...newCards, ...cardsToLearn, ...cardsToReview];

      const sessionCards = allCards.map((card, index) => {
        const sessionCard = {
          sessionId,
          cardId: card.id,
          status: SessionCardStatus.New,
          successfulRepeats: 0,
          failedRepeats: 0,
          plannedReviewTime: card.repeatTime ?? 0, // TODO: REMOVE!
        };
        return sessionCard;
      });

      //   console.log('useSessionTrainingLogic: bulk insert session cards', sessionCards.length);
      await bulkInsertTrainingCards(sessionCards);
      //   console.log('useSessionTrainingLogic: bulk insert session cards done');

      return session;
    } catch (e) {
      console.error('useSessionTrainingLogic: create session error', e);
      throw e;
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        if (collectionId === null) return;
        const trainingData = await getCollectionTrainingData(collectionId);
        // console.error('useSessionTrainingLogic useEffect: training data', trainingData);
        if (trainingData === null) {
          console.error('useSessionTrainingLogic useEffect: training data is null!');
          throw new Error('useSessionTrainingLogic useEffect: training data is null');
        }
        const curDateStripped = stripTimeFromDate(new Date());
        let session = await getStartedSession(collectionId, curDateStripped);
        console.debug('useSessionTrainingLogic: session', session);
        if (session === null) {
          console.log('useSessionTrainingLogic: session is null, creating session');
          session = await createSession(curDateStripped, collectionId, trainingData);
          console.log('useSessionTrainingLogic: session created', session);
        }
        if (session === null) {
          console.error('useSessionTrainingLogic: Error creating session');
        }
        console.log('useSessionTrainingLogic: current session', session);

        setSession(session);
        setTrainingData(trainingData);
      } catch (e) {
        console.error('useSessionTrainingLogic: error', e);
        throw e;
      }
    };
    run();
  }, [collectionId]);

  const resetSession = async () => {
    console.log('training reset');
    const curDateStripped = stripTimeFromDate(new Date());
    var session = await getStartedSession(Number(collectionId), curDateStripped);
    if (session !== null) {
      session.status = SessionStatus.Abandoned;
      await updateSession(session);
    }
    if (trainingData === null) {
      console.error('useSessionTrainingLogic resetSession: training data is null!');
      throw new Error('useSessionTrainingLogic resetSession: training data is null');
    }
    session = await createSession(curDateStripped, Number(collectionId), trainingData);
    setSession(session);
  };

  function calcScore(session: Session) {
    const score = session.newCards * 10 + session.reviewCards * 3 + session.totalViews;
    return score;
  }

  const completeTraining = async () => {
    if (session === null || session.status != SessionStatus.Started) return;

    console.log('completeTraining calc stats');
    session.status = SessionStatus.Completed;
    const score = calcScore(session);
    session.score = score;
    console.log('useSessionTrainingLogic.completeTraining  session score', session.score);

    //const trainingData = await getCollectionTrainingData(Number(collectionId));
    if (trainingData !== null) {
      const yesterday = getYesterdayAsNumber();
      if (trainingData.lastTrainingDate === yesterday) {
        trainingData.streak += 1;
      } else {
        trainingData.streak = 1;
      }
      trainingData.lastTrainingDate = getTodayAsNumber();
      trainingData.totalScore = (trainingData.totalScore ?? 0) + score;
      trainingData.totalCardViews += session.totalViews;
      trainingData.totalFailedResponses += session.failedResponses;
      trainingData.totalSuccessResponses += session.successResponses;

      await updateCollectionTrainingData(trainingData);
    }

    await updateSession(session);
  };
  return {
    session,
    trainingData,
    resetSession,
    completeTraining,
  };
}
