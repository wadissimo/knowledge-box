import { Card, CardStatus, useCardModel } from "@/src/data/CardModel";
import { Trainer } from "./Trainer";
import { i18n } from "@/src/lib/i18n";
import { Session, useSessionModel } from "@/src/data/SessionModel";
import { useCardTrainingService } from "../CardTrainingService";
import { getTomorrowAsNumber, truncateTime } from "@/src/lib/TimeUtils";
import { useSessionCardModel } from "@/src/data/SessionCardModel";

const ONE_DAY: number = 24 * 60 * 60 * 1000;
const ONE_MIN: number = 60 * 1000;
const SESSION_DURATION_DEFAULT = 20 * ONE_MIN; // 20 mins

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

const FAIL_DELTA_EASE_FACTOR = 0.4;
const SUCCESS_DELTA_EASE_FACTOR = 0.1;
const EASY_DELTA_EASE_FACTOR = 0.2;

const EASY_INTERVAL_GROW_FACTOR = 3;

const INITIAL_INTERVAL = ONE_MIN;
const AGAIN_INTERVAL_FAILED_REVIEW = 5 * ONE_MIN;

const STOP_LEARNING_INTERVAL = 15 * ONE_MIN;

export default function useDefaultTrainer(
  collectionId: number,
  maxNewCards: number,
  maxReviewCards: number,
  maxLearningCards: number
): Trainer {
  const { updateCard } = useCardModel();
  const {
    getSession: getSesionFromDb,
    newSession,
    getSessionById,
  } = useSessionModel();
  const { deleteSessionCard } = useSessionCardModel();
  const {
    selectNewTrainingCards,
    selectReviewCards,
    selectLearningCards,
    bulkInsertTrainingCards,
    bulkUpdateRepeatTime,
    getNextSessionCard,
  } = useCardTrainingService();

  function getName(): string {
    return i18n.t("trainer.defaultTrainerName");
  }
  function getDescription(): string {
    return i18n.t("trainer.defaultTrainerDescription");
  }

  async function getSession(key: string): Promise<Session | null> {
    return await getSesionFromDb(collectionId, key);
  }

  function mergeCards(
    newCards: Card[],
    learningCards: Card[],
    reviewCards: Card[]
  ): Card[] {
    const seen = new Set<number>();
    // Filter out duplicate cards based on 'id'
    const uniqueCards = (cards: Card[]) => {
      return cards.filter((card) => {
        if (seen.has(card.id)) return false;
        seen.add(card.id);
        return true;
      });
    };

    newCards = uniqueCards(newCards);
    learningCards = uniqueCards(learningCards);
    reviewCards = uniqueCards(reviewCards);

    const totalCards =
      newCards.length + learningCards.length + reviewCards.length;

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
    console.log("select new cards");
    const newCards = await selectNewTrainingCards(collectionId, maxNewCards);
    // Select review cards
    const cutOffTime = getTomorrowAsNumber() - 1;
    console.log("select review cards");
    const cardsToReview = await selectReviewCards(
      collectionId,
      cutOffTime,
      maxReviewCards
    );
    // Select learning cards
    console.log("select learning cards");
    const cardsToLearn = await selectLearningCards(
      collectionId,
      maxLearningCards
    );

    // interleave cards
    console.log("merge cards");
    const allCards = mergeCards(newCards, cardsToLearn, cardsToReview);
    const curTime = new Date().getDate();

    // update cards reviewTime
    allCards.forEach((card, index) => {
      card.repeatTime =
        curTime + index * Math.ceil(SESSION_DURATION_DEFAULT / allCards.length);
    });

    // update DB
    // update repeatTime
    console.log("create session");
    const sessionId = await newSession(
      collectionId,
      key,
      maxNewCards,
      maxReviewCards
    );
    const session = await getSessionById(sessionId);
    if (session === null) {
      throw new Error("Session not found.");
    }
    console.log("builk update");

    await Promise.all([
      bulkUpdateRepeatTime(allCards),
      bulkInsertTrainingCards(sessionId, allCards),
    ]);

    return session;
  }
  async function getNextCard(sessionId: number): Promise<Card | null> {
    return await getNextSessionCard(sessionId);
  }
  async function processUserResponse(
    sessionId: number,
    card: Card,
    response: string
  ): Promise<void> {
    const today = truncateTime(new Date());
    const curTime = new Date().getDate();

    let easeFactor = card.easeFactor ?? INITIAL_EASE_FACTOR;
    let interval = card.interval ?? INITIAL_INTERVAL;

    // update new card to learning
    if (card.status === CardStatus.New) card.status = CardStatus.Learning;

    switch (response) {
      case "again":
        console.log("again");

        // reduce ease factor
        card.easeFactor = Math.max(
          MIN_EASE_FACTOR,
          easeFactor - FAIL_DELTA_EASE_FACTOR
        );
        card.successfulRepeats = 0; // reset successful repeats
        card.failedRepeats = (card.failedRepeats ?? 0) + 1;

        if (card.status === CardStatus.Review) {
          card.status = CardStatus.Learning;
          card.interval = AGAIN_INTERVAL_FAILED_REVIEW; // TODO: reset the interval?
        } else {
          card.interval = INITIAL_INTERVAL; // TODO: reduce interval instead?
        }

        card.repeatTime = curTime + card.interval;

        // set a new order in the session
        await updateCard(card);
        break;

      case "good":
        console.log("good");
        card.successfulRepeats = (card.successfulRepeats ?? 0) + 1;
        card.failedRepeats = 0;
        card.easeFactor = easeFactor + SUCCESS_DELTA_EASE_FACTOR;
        card.interval = Math.round(interval * card.easeFactor);

        if (card.interval > STOP_LEARNING_INTERVAL) {
          console.log("pushed into next day");
          // remove from the session and update repeat time and interval
          card.status = CardStatus.Review;
          // push into the next day
          card.interval = Math.max(ONE_DAY, card.interval);
          card.prevRepeatTime = today;
          await deleteSessionCard(sessionId, card.id);
        }
        card.repeatTime = today + card.interval;
        await updateCard(card);
        break;

      case "easy":
        console.log("easy");
        card.successfulRepeats = (card.successfulRepeats ?? 0) + 1;
        card.failedRepeats = 0;
        card.easeFactor = easeFactor + EASY_DELTA_EASE_FACTOR;

        card.interval =
          Math.max(ONE_DAY, Math.round(interval * card.easeFactor)) *
          EASY_INTERVAL_GROW_FACTOR;
        card.status = CardStatus.Review;
        card.prevRepeatTime = today;
        card.repeatTime = today + card.interval;

        await Promise.all([
          deleteSessionCard(sessionId, card.id),
          updateCard(card),
        ]);

        break;
    }
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
