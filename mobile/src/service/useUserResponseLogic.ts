import { Card, CardStatus, useCardModel } from '../data/CardModel';
import { useReviewLogModel } from '../data/ReviewLogModel';
import { SessionCard, SessionCardStatus, useSessionCardModel } from '../data/SessionCardModel';
import { ONE_DAY, ONE_HOUR, ONE_MIN } from '../lib/TimeUtils';
import { fsrsScheduler, Grade, LEARNING_STEPS, RELEARNING_STEPS } from './trainers/FSRSScheduler';
import { responseToGrade } from './trainers/FSRSTrainer';

export default function useUserResponseLogic(
  updatePools: (card: Card, prevState: CardStatus) => Promise<void>
) {
  const { getSessionCard, updateSessionCard } = useSessionCardModel();
  const { updateCard } = useCardModel();
  const { newReviewLog } = useReviewLogModel();

  async function processUserResponse(
    sessionId: number,
    card: Card,
    response: string,
    reviewStartTime: number
  ): Promise<void> {
    const curTime = new Date().getTime();
    console.log('useUserResponseLogic: processUserResponse', card.front, response);
    const prevState = card.status;
    // update new card to learning
    if (card.status === CardStatus.New || card.status === null) card.status = CardStatus.Learning;

    card.repeatTime = card.repeatTime ?? curTime;

    const sessionCard: SessionCard | null = await getSessionCard(sessionId, card.id);
    if (sessionCard === null) {
      throw new Error("useUserResponseLogic: can't find session card");
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
    await updateSessionCard(sessionCard);
    await updateCard(card);

    if (card.repeatTime !== null) {
      await newReviewLog(
        card.id,
        card.status,
        Date.now() - reviewStartTime,
        card.repeatTime,
        responseToGrade(response),
        card.stability,
        card.difficulty
      );
    }
    // Update pool
    await updatePools(card, prevState);
  }

  async function preProcessUserResponse(
    sessionId: number,
    card: Card,
    response: string
  ): Promise<void> {
    // console.log('PoolingFSRSTrainer: preProcessUserResponse', card.front, response);

    // update new card to learning
    if (card.status === CardStatus.New || card.status === null) card.status = CardStatus.Learning;
    const curTime = new Date().getTime();
    card.repeatTime = card.repeatTime ?? curTime;

    const scheduler = fsrsScheduler(LEARNING_STEPS, RELEARNING_STEPS);
    const grade = responseToGrade(response);
    scheduler.reviewCard(card, grade);
  }

  return {
    processUserResponse,
    preProcessUserResponse,
  };
}
