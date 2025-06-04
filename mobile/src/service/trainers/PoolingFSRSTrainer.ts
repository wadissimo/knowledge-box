import { Card, CardStatus, useCardModel } from '@/src/data/CardModel';
import { Trainer } from './Trainer';
import { i18n } from '@/src/lib/i18n';
import { Session, useSessionModel } from '@/src/data/SessionModel';
import { useCardTrainingService } from '../CardTrainingService';
import { getTomorrowAsNumber, ONE_HOUR, truncateTime } from '@/src/lib/TimeUtils';
import { SessionCard, SessionCardStatus, useSessionCardModel } from '@/src/data/SessionCardModel';
import { fsrsScheduler, Grade } from './FSRSScheduler';
import { useReviewLogModel } from '@/src/data/ReviewLogModel';
import { useEffect, useState } from 'react';
import { usePoolingCardSelector } from '../usePoolingCardSelector';

const ONE_SEC: number = 1000;
const ONE_MIN: number = 60 * 1000;
const ONE_DAY: number = 24 * 60 * 60 * 1000;

const SESSION_DURATION_DEFAULT = 20 * ONE_MIN; // 20 mins

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

const FAIL_DELTA_EASE_FACTOR = 0.4;
const HARD_DELTA_EASE_FACTOR = 0.3;
const SUCCESS_DELTA_EASE_FACTOR = 0.1;
const EASY_DELTA_EASE_FACTOR = 0.2;

const EASY_INTERVAL_GROW_FACTOR = 3;

const INITIAL_INTERVAL = ONE_MIN;
const AGAIN_INTERVAL_FAILED_REVIEW = 5 * ONE_MIN;

const STOP_LEARNING_INTERVAL = 2 * ONE_MIN;

const LEARNING_STEPS = [ONE_MIN, ONE_MIN * 10];
const RELEARNING_STEPS = [ONE_MIN, ONE_MIN * 10];

export function responseToGrade(response: string): Grade {
  switch (response) {
    case 'hard':
      return Grade.Hard;
    case 'good':
      return Grade.Good;
    case 'easy':
      return Grade.Easy;
    case 'again':
      return Grade.Again;
    default:
      throw new Error('Invalid response');
  }
}

function useCardQueue(session: Session, onCardCompleted: (card: Card) => void) {
  const [queue, setQueue] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const { getAllSessionCards } = useCardTrainingService();
  useEffect(() => {
    const run = async () => {
      const sessionCards = await getAllSessionCards(session.id);
      //todo:interleave cards
      setQueue(sessionCards);
    };
    run();
  }, [session]);

  const updateQueue = async (updatedCard: Card, prevState: CardStatus) => {
    const cardLearningComplete =
      updatedCard.repeatTime !== null &&
      updatedCard.repeatTime > new Date().getTime() + ONE_DAY - ONE_HOUR;

    //remove from the queue
    if (queue[0].id !== updatedCard.id) {
      throw new Error('useCardQueue: updated card is not at the front of the queue');
    }
    queue.shift();
    if (cardLearningComplete) {
      onCardCompleted(updatedCard);
    } else {
      const reviewTime = updatedCard.repeatTime;
      if (reviewTime === null) {
        throw new Error('useCardQueue: reviewTime is null');
      }
      var insertIndex = queue.findIndex(
        card => card.repeatTime !== null && card.repeatTime > reviewTime
      );

      // update insert index if it's too low
      if (insertIndex !== -1) {
        if (
          (updatedCard.learningStep === 0 || updatedCard.learningStep === null) &&
          insertIndex < 3
        ) {
          insertIndex = 3;
        } else if (updatedCard.learningStep === 1 && insertIndex < 6) {
          insertIndex = 6;
        }
      }
      let newQueue;
      if (insertIndex === -1) {
        newQueue = [...queue, updatedCard];
      } else {
        newQueue = [...queue.slice(0, insertIndex), updatedCard, ...queue.slice(insertIndex)];
      }
      setQueue(newQueue);
      setCurrentCard(newQueue[0]);
    }
  };

  return { queue, currentCard };
}

export default function usePoolingFSRSTrainer(
  collectionId: number | null,
  maxNewCards: number,
  maxReviewCards: number,
  maxLearningCards: number
) {
  const [session, setSession] = useState<Session | null>(null);

  const { updateCard } = useCardModel();
  const { getStartedSession, newSession, getSessionById } = useSessionModel();
  const { getSessionCard, updateSessionCard } = useSessionCardModel();
  console.log('usePoolingFSRSTrainer', collectionId, maxNewCards, maxReviewCards, maxLearningCards);

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

  const onCardCompleted = (card: Card) => {
    throw new Error('PoolingFSRSTrainer: onCardCompleted is not implemented');
  };
  const {
    cardsToLearn,
    cardsToReview,
    cardsNew,
    currentCard,
    update: updatePools,
  } = usePoolingCardSelector(session, onCardCompleted, () => Promise.resolve());

  function getName(): string {
    return i18n.t('trainer.fsrsTrainerName');
  }
  function getDescription(): string {
    return i18n.t('trainer.fsrsTrainerDescription');
  }

  async function getSession(key: string): Promise<Session | null> {
    console.log('FSRSTrainer getSession');
    if (collectionId === null) return null;
    const startedSession = await getStartedSession(collectionId, key);
    setSession(startedSession);
    return startedSession;
  }

  async function createSession(key: string): Promise<Session> {
    if (collectionId === null) throw new Error('PoolingFSRSTrainer: collection ID is null');
    try {
      // Select cards
      console.log('PoolingFSRSTrainer: select learning cards');
      var cardsToLearn = await selectLearningAndRelearningCards(collectionId, maxLearningCards);
      console.log('PoolingFSRSTrainer: select learning cards done', cardsToLearn.length);
      console.log('PoolingFSRSTrainer: select new cards');
      var newCards = await selectNewTrainingCards(collectionId, Math.max(0, maxNewCards));
      console.log('PoolingFSRSTrainer: select new cards done', newCards.length);
      const cutOffTime = getTomorrowAsNumber() - 1;
      console.log('PoolingFSRSTrainer: select review cards');
      var cardsToReview = await selectReviewCards(collectionId, cutOffTime, maxReviewCards);
      console.log('PoolingFSRSTrainer: select review cards done', cardsToReview.length);
      // add more cards for review?
      if (cardsToReview.length < maxReviewCards) {
        const remainingCards = maxReviewCards - cardsToReview.length;
        const additionalCards = await selectReviewCards(
          collectionId,
          cutOffTime + ONE_DAY,
          remainingCards
        );
        cardsToReview = cardsToReview.concat(additionalCards);
      }

      console.log('PoolingFSRSTrainer: create session');
      const sessionId = await newSession(
        collectionId,
        key,
        newCards.length,
        cardsToReview.length,
        cardsToLearn.length
      );
      console.log('PoolingFSRSTrainer: session ID ', sessionId);
      const session = await getSessionById(sessionId);
      if (session === null) {
        throw new Error('Session not found.');
      }
      setSession(session);
      console.log('PoolingFSRSTrainer: bulk update');

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

      console.log('PoolingFSRSTrainer: bulk insert session cards', sessionCards.length);
      await bulkInsertTrainingCards(sessionCards);
      console.log('PoolingFSRSTrainer: bulk insert session cards done');

      return session;
    } catch (e) {
      console.error('PoolingFSRSTrainer: create session error', e);
      throw e;
    }
  }

  async function getNextCard(sessionId: number): Promise<Card | null> {
    console.log('PoolingFSRSTrainer: getNextCard');
    return currentCard;
  }
  async function preProcessUserResponse(
    sessionId: number,
    card: Card,
    response: string
  ): Promise<void> {
    console.log('PoolingFSRSTrainer: preProcessUserResponse', card.front, response);

    // update new card to learning
    if (card.status === CardStatus.New || card.status === null) card.status = CardStatus.Learning;
    const curTime = new Date().getTime();
    card.repeatTime = card.repeatTime ?? curTime;

    const scheduler = fsrsScheduler(LEARNING_STEPS, RELEARNING_STEPS);
    const grade = responseToGrade(response);
    scheduler.reviewCard(card, grade);
  }

  async function processUserResponse(
    sessionId: number,
    card: Card,
    response: string,
    sessionCards?: Card[]
  ): Promise<void> {
    const curTime = new Date().getTime();
    console.log('PoolingFSRSTrainer: processUserResponse', card.front, response);
    const prevState = card.status;
    // update new card to learning
    if (card.status === CardStatus.New || card.status === null) card.status = CardStatus.Learning;

    card.repeatTime = card.repeatTime ?? curTime;

    const sessionCard: SessionCard | null = await getSessionCard(sessionId, card.id);
    if (sessionCard === null) {
      throw new Error("FSRSTrainer: can't find session card");
    }
    if (sessionCard.status === SessionCardStatus.New)
      sessionCard.status = SessionCardStatus.Learning;

    const scheduler = fsrsScheduler(LEARNING_STEPS, RELEARNING_STEPS);
    const grade = responseToGrade(response);
    scheduler.reviewCard(card, grade);
    // safe guard repeatTime
    if (card.repeatTime === null) {
      throw new Error('card.repeatTime is null after scheduling');
    }

    switch (grade) {
      case Grade.Again:
        sessionCard.failedRepeats += 1;
        break;
      case Grade.Good:
        sessionCard.successfulRepeats += 1;
        break;
      case Grade.Easy:
        sessionCard.successfulRepeats += 1;
        break;
    }

    // If card is due in more than a day, mark it as complete
    const cardLearningComplete = card.repeatTime > curTime + ONE_DAY - ONE_HOUR;
    if (cardLearningComplete) {
      sessionCard.status = SessionCardStatus.Complete;
    }
    sessionCard.plannedReviewTime = card.repeatTime;

    await Promise.all([updateSessionCard(sessionCard), updateCard(card)]).catch(e => {
      console.log('FSRSTrainer: update card error', e);
    });

    // Update pool
    updatePools(card, prevState);
  }

  return {
    currentCard,
    getName,
    getDescription,
    getSession,
    createSession,
    getNextCard,
    processUserResponse,
    preProcessUserResponse,
  };
}
