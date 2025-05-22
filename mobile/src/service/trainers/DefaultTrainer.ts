import { Card, CardStatus, useCardModel } from '@/src/data/CardModel';
import { Trainer } from './Trainer';
import { i18n } from '@/src/lib/i18n';
import { Session, useSessionModel } from '@/src/data/SessionModel';
import { useCardTrainingService } from '../CardTrainingService';
import { getTomorrowAsNumber, truncateTime } from '@/src/lib/TimeUtils';
import { SessionCard, SessionCardStatus, useSessionCardModel } from '@/src/data/SessionCardModel';

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

export default function useDefaultTrainer(
  collectionId: number,
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
  } = useCardTrainingService();
  console.log('useDefaultTrainer, maxNewCards', maxNewCards);

  function getName(): string {
    return i18n.t('trainer.defaultTrainerName');
  }
  function getDescription(): string {
    return i18n.t('trainer.defaultTrainerDescription');
  }

  async function getSession(key: string): Promise<Session | null> {
    console.log('DefaultTrainer getSession');
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
    console.log('DefaultTrainer nextCard 2', nextCard);

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
    // Select new cards
    console.log('select new cards');
    var newCards = await selectNewTrainingCards(collectionId, maxNewCards);
    // Select review cards
    const cutOffTime = getTomorrowAsNumber() - 1;
    console.log('select review cards');
    var cardsToReview = await selectReviewCards(collectionId, cutOffTime, maxReviewCards);
    // Select learning cards
    console.log('select learning cards');
    var cardsToLearn = await selectLearningCards(collectionId, maxLearningCards);

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
    const deltaTime = Math.min(20 * ONE_SEC, Math.ceil(SESSION_DURATION_DEFAULT / allCards.length));
    allCards.forEach((card, index) => {
      card.repeatTime = curTime + index * deltaTime;
    });

    // update DB
    // update repeatTime
    console.log('create session');
    const sessionId = await newSession(
      collectionId,
      key,
      newCards.length,
      cardsToReview.length,
      cardsToLearn.length
    );
    const session = await getSessionById(sessionId);
    if (session === null) {
      throw new Error('Session not found.');
    }
    console.log('builk update');

    await Promise.all([
      bulkUpdateRepeatTime(allCards),
      bulkInsertTrainingCards(sessionId, allCards),
    ]);

    return session;
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

    let easeFactor = card.easeFactor ? card.easeFactor : INITIAL_EASE_FACTOR;
    let interval = card.interval ? card.interval : INITIAL_INTERVAL;

    // update new card to learning
    if (card.status === CardStatus.New || card.status === null) card.status = CardStatus.Learning;

    card.repeatTime = card.repeatTime ?? curTime;

    const sessionCard: SessionCard | null = await getSessionCard(sessionId, card.id);
    if (sessionCard === null) {
      throw new Error("can't find session card");
    }
    if (sessionCard.status === SessionCardStatus.New)
      sessionCard.status = SessionCardStatus.Learning;

    switch (response) {
      case 'hard':
        //Todo: implement hard
        card.easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - HARD_DELTA_EASE_FACTOR);
        card.interval = Math.round(interval * card.easeFactor);
        break;
      case 'again':
        console.log(response);

        // reduce ease factor
        card.easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - FAIL_DELTA_EASE_FACTOR);
        card.successfulRepeats = 0; // reset successful repeats
        card.failedRepeats = (card.failedRepeats ?? 0) + 1;

        if (card.status === CardStatus.Review) {
          card.status = CardStatus.Learning;
          card.interval = AGAIN_INTERVAL_FAILED_REVIEW; // TODO: reset the interval?
        } else {
          card.interval = INITIAL_INTERVAL; // TODO: reduce interval instead?
        }

        card.repeatTime += card.interval;

        sessionCard.failedRepeats += 1;

        break;

      case 'good':
        console.log('good');
        card.successfulRepeats = (card.successfulRepeats ?? 0) + 1;
        card.failedRepeats = 0;
        card.easeFactor = easeFactor + SUCCESS_DELTA_EASE_FACTOR;
        card.interval = Math.round(interval * card.easeFactor);

        if (card.interval > STOP_LEARNING_INTERVAL) {
          console.log('pushed into next day');
          // remove from the session and update repeat time and interval
          card.status = CardStatus.Review;
          // push into the next day
          card.interval = Math.max(ONE_DAY, card.interval);
          card.repeatTime = curTime;
          card.prevRepeatTime = curTime;
          sessionCard.status = SessionCardStatus.Complete;
        }
        card.repeatTime += card.interval;
        sessionCard.successfulRepeats += 1;
        break;

      case 'easy':
        console.log('easy');
        card.successfulRepeats = (card.successfulRepeats ?? 0) + 1;
        card.failedRepeats = 0;
        card.easeFactor = easeFactor + EASY_DELTA_EASE_FACTOR;

        card.interval =
          Math.max(ONE_DAY, Math.round(interval * card.easeFactor)) * EASY_INTERVAL_GROW_FACTOR;
        card.status = CardStatus.Review;
        card.prevRepeatTime = curTime;
        card.repeatTime = curTime + card.interval;

        sessionCard.status = SessionCardStatus.Complete;
        sessionCard.successfulRepeats += 1;
        break;
      default:
        throw new Error('incorrect user response');
    }

    if (sessionCards) {
      // now check that we pushed at least 2 cards ahead if possible (or 1 card if array is too small)
      if (sessionCards.length > 2) {
        if ((sessionCards[2].repeatTime ?? 0) > card.repeatTime)
          card.repeatTime = (sessionCards[2].repeatTime ?? 0) + 1;
      } else if (sessionCards.length > 1 && (sessionCards[1].repeatTime ?? 0) > card.repeatTime) {
        card.repeatTime = (sessionCards[1].repeatTime ?? 0) + 1;
      }
    }
    await Promise.all([updateSessionCard(sessionCard), updateCard(card)]);
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
