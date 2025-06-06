import { useState } from 'react';

import { useCardTrainingService } from './CardTrainingService';

import { useEffect } from 'react';
import { Card, CardStatus } from '../data/CardModel';
import { Session } from '../data/SessionModel';
import { ONE_DAY, ONE_HOUR } from '../lib/TimeUtils';

export function usePoolingCardSelector(
  session: Session | null,
  onCardCompleted: (card: Card) => Promise<void>,
  onTrainingComplete: () => Promise<void>
) {
  const [cardsToLearn, setCardsToLearn] = useState<Card[]>([]);
  const [cardsToReview, setCardsToReview] = useState<Card[]>([]);
  const [cardsNew, setCardsNew] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);

  const { getAllSessionCards } = useCardTrainingService();
  useEffect(() => {
    const run = async () => {
      if (session === null) {
        console.debug('usePoolingCardSelector, session is null');
        return;
      }
      const sessionCards = await getAllSessionCards(session.id);
      console.debug('usePoolingCardSelector, session = ', session);
      console.debug('usePoolingCardSelector, sessionCards.length = ', sessionCards.length);
      if (sessionCards.length === 0) {
        setCurrentCard(null);
        setCardsToLearn([]);
        setCardsToReview([]);
        setCardsNew([]);
        return;
      }
      setCardsToLearn(
        sessionCards.filter(
          c => c.status === CardStatus.Learning || c.status === CardStatus.Relearning
        )
      );
      setCardsToReview(sessionCards.filter(c => c.status === CardStatus.Review));
      setCardsNew(sessionCards.filter(c => c.status === CardStatus.New));
      const firstCard = sessionCards[0];
      setCurrentCard(firstCard);

      console.debug('usePoolingCardSelector, currentCard  = ', firstCard.front);
    };
    run();
  }, [session]);

  const rollbackToCard = async (card: Card) => {
    setCurrentCard(card);
  };
  const update = async (updatedCard: Card, prevState: CardStatus) => {
    if (session === null) {
      throw new Error('usePoolingCardSelector: session is null');
    }
    // remove the card from pools first
    // todo: improve performance
    var updatedCardsNew = cardsNew;
    var updatedCardsToLearn = cardsToLearn;
    var updatedCardsToReview = cardsToReview;
    console.debug('usePoolingCardSelector.update, updatedCard = ', updatedCard.front);
    console.debug('usePoolingCardSelector.update, state = ', updatedCard.status);
    console.debug('usePoolingCardSelector.update, prevState = ', prevState);
    console.debug('usePoolingCardSelector.update, cardsNew.length = ', cardsNew.length);
    console.debug('usePoolingCardSelector.update, cardsToLearn.length = ', cardsToLearn.length);
    console.debug('usePoolingCardSelector.update, cardsToReview.length = ', cardsToReview.length);
    if (prevState === CardStatus.New) {
      updatedCardsNew = cardsNew.filter(c => c.id !== updatedCard.id);
    } else if (prevState === CardStatus.Learning || prevState === CardStatus.Relearning) {
      updatedCardsToLearn = cardsToLearn.filter(c => c.id !== updatedCard.id);
    } else if (prevState === CardStatus.Review) {
      updatedCardsToReview = cardsToReview.filter(c => c.id !== updatedCard.id);
    }
    // check if training for this card is complete
    const cardLearningComplete =
      updatedCard.repeatTime !== null &&
      updatedCard.repeatTime > new Date().getTime() + ONE_DAY - ONE_HOUR;
    if (cardLearningComplete) {
      console.log('usePoolingCardSelector.update, cardLearningComplete = ', updatedCard.front);
      await onCardCompleted(updatedCard);
    }
    // check if there are any cards left, if not, update the state and return
    if (
      updatedCardsNew.length === 0 &&
      updatedCardsToLearn.length === 0 &&
      updatedCardsToReview.length === 0
    ) {
      if (cardLearningComplete) {
        // no cards left
        setCurrentCard(null);
        setCardsToLearn([]);
        setCardsToReview([]);
        setCardsNew([]);
        await onTrainingComplete();
      } else {
        // cards left, but this card is not due yet
        setCurrentCard(updatedCard);
        if (updatedCard.status === CardStatus.Review) {
          updatedCardsToReview = [updatedCard];
        } else {
          updatedCardsToLearn = [updatedCard];
        }
      }
      setCardsToLearn(updatedCardsToLearn);
      setCardsToReview(updatedCardsToReview);
      setCardsNew(updatedCardsNew);
      return;
    }
    // there are other cards in some pools
    // select new current card (before inserting updated card to avoid selecting the same card again)
    const selectedPool = selectCardFromPools(
      updatedCardsNew,
      updatedCardsToLearn,
      updatedCardsToReview
    );
    if (selectedPool === null || selectedPool.length === 0) {
      throw new Error('PoolingFSRSTrainer usePoolingCardSelector: selectedPool is empty');
    }
    // get next card from the selected pool
    const firstCard = selectedPool[0];

    setCurrentCard(firstCard);
    console.debug('usePoolingCardSelector.update, selectedCard = ', firstCard.front);

    // reinsert updated card back
    if (!cardLearningComplete) {
      if (updatedCard.status === CardStatus.New) {
        updatedCardsNew = insertCard(updatedCardsNew, updatedCard);
      } else if (
        updatedCard.status === CardStatus.Learning ||
        updatedCard.status === CardStatus.Relearning
      ) {
        updatedCardsToLearn = insertCard(updatedCardsToLearn, updatedCard);
      } else if (updatedCard.status === CardStatus.Review) {
        updatedCardsToReview = insertCard(updatedCardsToReview, updatedCard);
      } else {
        throw new Error('PoolingFSRSTrainer usePoolingCardSelector: unknown card status');
      }
    }

    setCardsNew(updatedCardsNew);
    setCardsToLearn(updatedCardsToLearn);
    setCardsToReview(updatedCardsToReview);
  };

  return { cardsToLearn, cardsToReview, cardsNew, currentCard, update, rollbackToCard };
}

const insertCard = (pool: Card[], card: Card) => {
  if (pool.length === 0) {
    return [card];
  }
  const cardReviewTime = card.repeatTime;
  if (cardReviewTime === null) {
    return [...pool, card];
  }
  const insertIndex = pool.findIndex(c => c.repeatTime !== null && c.repeatTime > cardReviewTime);
  if (insertIndex === -1) {
    return [...pool, card];
  }
  return [...pool.slice(0, insertIndex), card, ...pool.slice(insertIndex)];
};

function selectCardFromPools(
  newCards: Card[],
  learningCards: Card[],
  reviewCards: Card[],
  newCardsWeight: number = 1.0,
  learningCardsWeight: number = 1.0,
  reviewCardsWeight: number = 1.0
): Card[] | null {
  const totalCards = newCards.length + learningCards.length + reviewCards.length;
  if (totalCards === 0) return null;

  const now = new Date().getTime();
  // get a random number
  var p = Math.random();

  // try to avoid taking cards which are not due yet
  if (learningCards.length > 0) {
    if (learningCards[0].repeatTime !== null && learningCards[0].repeatTime > now) {
      learningCardsWeight = 0;
    }
  }

  const newP = (newCards.length / totalCards) * newCardsWeight;
  const learnP = (learningCards.length / totalCards) * learningCardsWeight;
  const reviewP = (reviewCards.length / totalCards) * reviewCardsWeight;
  console.log('selectCardFromPools', newP, learnP, reviewP);
  //rescale p
  p = p * (newP + learnP + reviewP);
  console.log('selectCardFromPools', p);
  if (p <= newP && newCards.length > 0) {
    console.log('selectCardFromPools', 'new', p, newP);
    return newCards;
  }
  if (p <= newP + learnP && learningCards.length > 0) {
    console.log('selectCardFromPools', 'learn', p, newP, learnP);
    return learningCards;
  }
  if (reviewCards.length > 0) {
    return reviewCards;
  }
  if (learningCards.length > 0) {
    return learningCards;
  }
  if (newCards.length > 0) {
    return newCards;
  }
  return null;
}
