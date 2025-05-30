import { Card, CardStatus, useCardModel } from '@/src/data/CardModel';
import { Trainer } from './Trainer';
import { i18n } from '@/src/lib/i18n';
import { Session, useSessionModel } from '@/src/data/SessionModel';
import { useCardTrainingService } from '../CardTrainingService';
import { getTomorrowAsNumber, ONE_HOUR, truncateTime } from '@/src/lib/TimeUtils';
import { SessionCard, SessionCardStatus, useSessionCardModel } from '@/src/data/SessionCardModel';
import { fsrsScheduler, Grade } from './FSRSScheduler';

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

function responseToGrade(response: string): Grade {
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

export default function useFSRSTrainer(
  collectionId: number | null,
  maxNewCards: number,
  maxReviewCards: number,
  maxLearningCards: number
): Trainer {
  const { updateCard } = useCardModel();
  const { getStartedSession, newSession, getSessionById } = useSessionModel();
  const { getSessionCard, updateSessionCard } = useSessionCardModel();
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
  console.log('useFSRSTrainer, maxNewCards', maxNewCards);

  function getName(): string {
    return i18n.t('trainer.fsrsTrainerName');
  }
  function getDescription(): string {
    return i18n.t('trainer.fsrsTrainerDescription');
  }

  async function getSession(key: string): Promise<Session | null> {
    console.log('FSRSTrainer getSession');
    if (collectionId === null) return null;
    const session = await getStartedSession(collectionId, key);
    if (session === null) {
      return null;
    }

    const nextCard = await getNextCard(session.id);
    if (nextCard !== null && nextCard.repeatTime !== null) {
      // check if cards need to adjust time
      // TODO: implement time adjustment . why is it needed? if needed re-write bulkUpdate as this locks the database and fails
      // const curTime = new Date().getTime();
      // const deltaTime = nextCard.repeatTime - curTime;
      // if (Math.abs(deltaTime) > 5 * ONE_MIN) {
      //   // > 5 min, then adjust time
      //   const sessionCards = await getAllSessionCards(session.id);
      //   sessionCards.forEach(card => {
      //     if (card.repeatTime) {
      //       card.repeatTime -= deltaTime;
      //     }
      //   });
      //   await bulkUpdateRepeatTime(sessionCards);
      // }
    }
    console.log('FSRSTrainer nextCard 2', nextCard);

    return session;
  }

  function mergeCards(newCards: Card[], learningCards: Card[], reviewCards: Card[]): Card[] {
    const totalCards = newCards.length + learningCards.length + reviewCards.length;

    const result: Card[] = [];
    let newIndex = 0,
      learningIndex = 0,
      reviewIndex = 0;

    // Helper function to add card to the result
    const addCard = (card: Card | undefined) => {
      if (card) result.push(card);
    };

    // Add cards with appropriate spacing:
    // new and learning cards evenly distributed in first 50%
    var lastNew = false;
    const newCardsThr = 0.5 * totalCards;
    for (let i = 0; i < totalCards; i++) {
      const r = Math.random();
      const remCards = Math.max(newCardsThr - i, 1);
      var newP = (newCards.length - newIndex) / remCards;
      if (lastNew) {
        newP /= 1.3; // reduce a chance of repeating new cards
      }
      const learnP = (learningCards.length - learningIndex) / remCards;
      lastNew = false;
      if (r <= newP && newIndex < newCards.length) {
        addCard(newCards[newIndex++]);
        lastNew = true;
      } else if (r <= newP + learnP && learningIndex < learningCards.length) {
        addCard(learningCards[learningIndex++]);
      } else if (reviewIndex < reviewCards.length) {
        addCard(reviewCards[reviewIndex++]);
      }
    }

    //console.log("main cycle result", result);
    // In case there are leftover new or learning cards, add them to the appropriate sections
    while (newIndex < newCards.length) {
      addCard(newCards[newIndex++]);
    }
    while (learningIndex < learningCards.length) {
      addCard(learningCards[learningIndex++]);
    }
    while (reviewIndex < reviewCards.length) {
      addCard(reviewCards[reviewIndex++]);
    }
    // console.log("end result", result);

    return result;
  }

  async function createSession(key: string): Promise<Session> {
    if (collectionId === null) throw new Error('DefaultTrainerCollection ID is null');
    try {
      // Select new cards

      console.log('FSRSTrainer: select learning cards');
      var cardsToLearn = await selectLearningAndRelearningCards(collectionId, maxLearningCards);
      console.log('FSRSTrainer: select new cards');
      var newCards = await selectNewTrainingCards(collectionId, Math.max(0, maxNewCards));
      // Select review cards
      const cutOffTime = getTomorrowAsNumber() - 1;
      console.log('FSRSTrainer: select review cards');
      var cardsToReview = await selectReviewCards(collectionId, cutOffTime, maxReviewCards);
      //add more cards for review?
      if (cardsToReview.length < maxReviewCards) {
        const remainingCards = maxReviewCards - cardsToReview.length;
        const additionalCards = await selectReviewCards(
          collectionId,
          cutOffTime + ONE_DAY,
          remainingCards
        );
        cardsToReview = cardsToReview.concat(additionalCards);
      }

      const seen = new Set<number>();
      // Filter out duplicate cards based on 'id'
      const uniqueCards = (cards: Card[]) => {
        return cards.filter(card => {
          if (seen.has(card.id)) return false;
          seen.add(card.id);
          return true;
        });
      };

      newCards = uniqueCards(newCards);
      cardsToLearn = uniqueCards(cardsToLearn);
      cardsToReview = uniqueCards(cardsToReview);

      // interleave cards
      const allCards = mergeCards(newCards, cardsToLearn, cardsToReview);
      const curTime = new Date().getTime();

      // update cards reviewTime
      const deltaTime = Math.min(
        20 * ONE_SEC,
        Math.ceil(SESSION_DURATION_DEFAULT / allCards.length)
      );
      //update only new/learning cards
      allCards.forEach((card, index) => {
        card.repeatTime = curTime + index * deltaTime;
      });

      // update DB
      // update repeatTime
      console.log('DefaultTrainer: create session');
      const sessionId = await newSession(
        collectionId,
        key,
        newCards.length,
        cardsToReview.length,
        cardsToLearn.length
      );
      console.log('DefaultTrainer: session ID ', sessionId);
      const session = await getSessionById(sessionId);
      if (session === null) {
        throw new Error('Session not found.');
      }
      console.log('DefaultTrainer: bulk update');

      await Promise.all([
        bulkUpdateRepeatTime(allCards),
        bulkInsertTrainingCards(sessionId, allCards),
      ]).catch(e => {
        console.log('DefaultTrainer: bulk update error', e);
      });
      return session;
    } catch (e) {
      console.log('DefaultTrainer: create session error', e);
      throw e;
    }
  }
  async function getNextCard(sessionId: number): Promise<Card | null> {
    return await getNextCardDb(sessionId);
  }

  async function processUserResponse(
    sessionId: number,
    card: Card,
    response: string,
    sessionCards?: Card[]
  ): Promise<void> {
    const curTime = new Date().getTime();

    // update new card to learning
    if (card.status === CardStatus.New || card.status === null) card.status = CardStatus.Learning;

    card.repeatTime = card.repeatTime ?? curTime;

    const sessionCard: SessionCard | null = await getSessionCard(sessionId, card.id);
    if (sessionCard === null) {
      throw new Error("can't find session card");
    }
    if (sessionCard.status === SessionCardStatus.New)
      sessionCard.status = SessionCardStatus.Learning;

    const scheduler = fsrsScheduler(LEARNING_STEPS, RELEARNING_STEPS);
    const grade = responseToGrade(response);
    scheduler.reviewCard(card, grade);
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
    if (card.repeatTime > curTime + ONE_DAY - ONE_HOUR) {
      sessionCard.status = SessionCardStatus.Complete;
    }

    await Promise.all([updateSessionCard(sessionCard), updateCard(card)]).catch(e => {
      console.log('DefaultTrainer: update card error', e);
    });
  }

  return {
    getName,
    getDescription,
    getSession,
    createSession,
    getNextCard,
    processUserResponse,
  };
}
