import { useEffect, useState } from 'react';
import { Collection, useCollectionModel } from '../data/CollectionModel';
import { useSessionModel } from '../data/SessionModel';
import { Card, useCardModel } from '../data/CardModel';
import { useSessionCardModel } from '../data/SessionCardModel';

import useSessionTrainingLogic from './useSessionTrainingLogic';
import useUserResponseLogic from './useUserResponseLogic';
import { usePoolingCardSelector } from './usePoolingCardSelector';

function useTrainingFlow(collectionId: number | null, onTrainingCompleted: () => Promise<void>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);

  const [currentCardCopy, setCurrentCardCopy] = useState<Card | null>(null);
  const [prevCardCopy, setPrevCardCopy] = useState<Card | null>(null);
  const [reviewStartTime, setReviewStartTime] = useState<number>(0);

  const { getCollectionById } = useCollectionModel();
  const { deleteSessionCard } = useSessionCardModel();
  const { learnCardLater } = useCardModel();
  const { updateSession } = useSessionModel();

  // logic for creating and managing a session
  const { session, trainingData, resetSession, completeTraining } =
    useSessionTrainingLogic(collectionId);

  const onCardCompleted = async (card: Card) => {
    if (session === null) {
      console.error('TrainingFlow: onCardCompleted: session is null');
      return;
    }
    console.debug('TrainingFlow: onCardCompleted', card.front);
    // remove Card from the session
    // await deleteSessionCard(session.id, card.id);
  };

  const handleTrainingCompleted = async () => {
    console.debug('TrainingFlow: onTrainingCompleted');
    await completeTraining();
    await onTrainingCompleted();
  };

  // Logic for selecting next card
  const {
    currentCard,
    update: updatePools,
    cardsToLearn,
    cardsToReview,
    cardsNew,
    currentPool,
  } = usePoolingCardSelector(session, onCardCompleted, handleTrainingCompleted);

  // Logic for processing user response
  const { processUserResponse, preProcessUserResponse } = useUserResponseLogic(updatePools);

  console.debug(
    'TrainingFlow: currentCard',
    currentCard?.front,
    'session',
    session?.id,
    'currentPool',
    currentPool
  );

  // Effects:

  useEffect(() => {
    const run = async () => {
      if (collectionId === null || collectionId === undefined) return;
      try {
        setIsLoaded(false);
        const collection = await getCollectionById(collectionId);
        if (collection) {
          setCollection(collection);
        } else {
          console.log('TrainingFlow: Collection not found');
          setError('Collection not found');
        }
      } catch (e) {
        console.log('TrainingFlow: Error in useTrainingFlow', e);
        setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      } finally {
        setIsLoaded(true);
      }
    };
    run();
  }, [collectionId]);

  if (currentCard !== null && currentCard.id !== currentCardCopy?.id) {
    console.debug('TrainingFlow: currentCard changed', currentCard.front);
    // Card is changed
    setPrevCardCopy(currentCardCopy);
    setCurrentCardCopy({ ...currentCard });
    setReviewStartTime(Date.now());
  }
  // Functions:

  const onUserResponse = async (userResponse: 'again' | 'hard' | 'good' | 'easy') => {
    if (session === null || currentCard === null) return;
    try {
      console.log('TrainingFlow: user response', userResponse);
      //increase view count
      session.totalViews += 1;
      switch (userResponse) {
        case 'again':
          session.failedResponses += 1;
          break;
        case 'good':
        case 'easy':
          session.successResponses += 1;
          break;
      }
      await updateSession(session);

      console.log(
        'TrainingFlow: processUserResponse',
        session.id,
        currentCard?.front,
        userResponse
      );

      await processUserResponse(session.id, currentCard, userResponse, reviewStartTime);
      // Add review log
    } catch (e) {
      console.error('TrainingFlow: Error in onUserResponse', e);
    }
  };

  const onPostpone = async () => {
    if (currentCard !== null && session !== null) {
      console.log('deleting session card', session.id, currentCard.id);
      // increase priority, make the card new again so that it would bew selected after all other lower priority new cards.
      await learnCardLater(currentCard);
      await deleteSessionCard(session.id, currentCard.id);

      // const card = await trainer.getNextCard(session.id);
      // if (card === null) {
      //   await onTrainingComplete();
      // }
      // setCurrentCard(card);
    }
  };

  const onResetTraining = async () => {
    await resetSession();
  };

  const isRollbackPossible = () => {
    return prevCardCopy !== null;
  };

  const rollbackToPrevCard = () => {
    throw new Error('Not implemented');
    // setCurrentCardCopy(null);
    // setCurrentCard(prevCardCopy);
    // setPrevCardCopy(null);
  };

  const preprocessUserResponse = async (
    userResponse: 'again' | 'hard' | 'good' | 'easy'
  ): Promise<Card | null> => {
    if (session === null || currentCard === null) return null;
    //copy current card (clone)
    const copyCard = { ...currentCard };
    await preProcessUserResponse(session.id, copyCard, userResponse);
    return copyCard;
  };

  return {
    isLoaded,
    error,
    collection,
    trainingData,
    session,
    currentCard,
    onUserResponse,
    onResetTraining,
    onPostpone,
    preprocessUserResponse,
    rollbackToPrevCard,
    isRollbackPossible,
    cardsToLearn,
    cardsToReview,
    cardsNew,
    currentPool,
  };
}

export { useTrainingFlow };
