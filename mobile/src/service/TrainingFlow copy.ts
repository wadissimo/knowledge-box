import { useEffect, useState } from 'react';
import { Collection, CollectionTrainingData, useCollectionModel } from '../data/CollectionModel';
import useDefaultTrainer from './trainers/DefaultTrainer';
import { Trainer } from './trainers/Trainer';
import { Session, SessionStatus, useSessionModel } from '../data/SessionModel';
import { Card, useCardModel } from '../data/CardModel';
import { SessionCardStatus, useSessionCardModel } from '../data/SessionCardModel';
import { getTodayAsNumber, getYesterdayAsNumber, stripTimeFromDate } from '../lib/TimeUtils';
import useFSRSTrainer, { responseToGrade } from './trainers/FSRSTrainer';
import { ReviewLog, useReviewLogModel } from '../data/ReviewLogModel';
import usePoolingFSRSTrainer from './trainers/PoolingFSRSTrainer';

function useTrainingFlow(collectionId: number | null) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [trainingData, setTrainingData] = useState<CollectionTrainingData | null>(null);

  const [session, setSession] = useState<Session | null>(null);

  const [currentCardCopy, setCurrentCardCopy] = useState<Card | null>(null);
  const [prevCardCopy, setPrevCardCopy] = useState<Card | null>(null);
  const [reviewStartTime, setReviewStartTime] = useState<number>(0);

  const { getCollectionById, getCollectionTrainingData, updateCollectionTrainingData } =
    useCollectionModel();
  const { deleteSessionCard } = useSessionCardModel();
  const { learnCardLater } = useCardModel();
  const { updateSession, getStartedSession } = useSessionModel();
  const { newReviewLog } = useReviewLogModel();

  // const trainer = useDefaultTrainer(
  //   trainingData === null ? null : collectionId,
  //   trainingData?.maxNewCards ?? 0,
  //   trainingData?.maxReviewCards ?? 0,
  //   trainingData?.maxLearningCards ?? 0
  // );
  const { currentCard, ...trainer } = usePoolingFSRSTrainer(
    trainingData === null ? null : collectionId,
    trainingData?.maxNewCards ?? 0,
    trainingData?.maxReviewCards ?? 0,
    trainingData?.maxLearningCards ?? 0
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
          const trainingData = await getCollectionTrainingData(collectionId);
          if (trainingData) {
            setTrainingData(trainingData);
          } else {
            console.log('TrainingFlow: Training data not found');
            setError('Training data not found');
          }
        } else {
          console.log('TrainingFlow: Collection not found');
          setError('Collection not found');
        }
      } catch (e) {
        console.log('TrainingFlow: Error in useTrainingFlow', e);
        setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      }
    };
    run();
  }, [collectionId]);

  useEffect(() => {
    const run = async () => {
      if (trainingData === null || error !== null) return;
      try {
        await loadSession();
      } catch (e) {
        console.log('TrainingFlow: Error in useTrainingFlow', e);
        setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      } finally {
        setIsLoaded(true);
      }
    };

    run();
  }, [trainingData]);

  if (currentCard !== null && currentCard.id !== currentCardCopy?.id) {
    // Card is changed
    setPrevCardCopy(currentCardCopy);
    setCurrentCardCopy({ ...currentCard });
    setReviewStartTime(Date.now());
  }
  // Functions:
  const loadSession = async () => {
    const curDateStripped = stripTimeFromDate(new Date());
    let session = await trainer.getSession(curDateStripped);
    if (session === null) {
      console.log('TrainingFlow: creating session');
      session = await trainer.createSession(curDateStripped);
    }
    if (session === null) {
      console.log('TrainingFlow: Error creating session');
      setError('Error creating session');
    }
    console.log('TrainingFlow: session', session);
    // const card = await trainer.getNextCard(session.id);
    // if (card === null) {
    //   await onTrainingComplete();
    // }
    // setCurrentCard(card);
    setSession(session);
  };

  const onUserResponse = async (userResponse: 'again' | 'hard' | 'good' | 'easy') => {
    if (session === null || currentCard === null || trainer === null) return;
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

    console.log('TrainingFlow: processUserResponse', session.id, currentCard?.front, userResponse);

    await trainer.processUserResponse(session.id, currentCard, userResponse);
    // Add review log
    if (currentCard.repeatTime !== null) {
      await newReviewLog(
        currentCard.id,
        currentCard.status,
        Date.now() - reviewStartTime,
        currentCard.repeatTime,
        responseToGrade(userResponse),
        currentCard.stability,
        currentCard.difficulty
      );
    }

    // const card = await trainer.getNextCard(session.id);
    // console.log(
    //   'TrainingFlow: getNextCard',
    //   session.id,
    //   currentCard?.front,
    //   userResponse,
    //   card?.front
    // );
    // if (card === null) {
    //   await onTrainingComplete();
    // }
    // setCurrentCard(card);
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
    console.log('training reset');
    const curDateStripped = stripTimeFromDate(new Date());
    var session = await getStartedSession(Number(collectionId), curDateStripped);
    if (session !== null) {
      session.status = SessionStatus.Abandoned;
      await updateSession(session);
    }
    await loadSession();
  };

  function calcScore(session: Session) {
    const score = session.newCards * 10 + session.reviewCards * 3 + session.totalViews;
    return score;
  }

  const onTrainingComplete = async () => {
    if (session === null || session.status != SessionStatus.Started) return;

    console.log('completeTraining calc stats');
    session.status = SessionStatus.Completed;
    const score = calcScore(session);
    session.score = score;
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
    await trainer.preProcessUserResponse(session.id, copyCard, userResponse);
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
  };
}

export { useTrainingFlow };
