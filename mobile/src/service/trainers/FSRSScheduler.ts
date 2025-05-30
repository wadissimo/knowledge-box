import { Card, CardStatus } from '@/src/data/CardModel';
import { getTodayAsNumber, ONE_DAY, truncateTime } from '@/src/lib/TimeUtils';
enum Grade {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}
const DEFAULT_PARAMETERS = [
  0.2172, 1.1771, 3.2602, 16.1507, 7.0114, 0.57, 2.0966, 0.0069, 1.5261, 0.112, 1.0178, 1.849,
  0.1133, 0.3127, 2.2934, 0.2191, 3.0004, 0.7536, 0.3332, 0.1437, 0.2,
];
const DECAY = -DEFAULT_PARAMETERS[20];
const FACTOR = Math.exp(Math.log(0.9) / DECAY) - 1;
const STABILITY_MIN = 0.001;
const MIN_S_MUL = 1.0 / Math.exp(DEFAULT_PARAMETERS[17] * DEFAULT_PARAMETERS[18]);
const TARGET_RETENTION = 0.9;
const MAX_INTERVAL = 36500;
const initialStability = (grade: Grade): number => {
  return DEFAULT_PARAMETERS[grade - 1];
};
const initialDifficulty = (grade: Grade): number => {
  return DEFAULT_PARAMETERS[4] - Math.exp(DEFAULT_PARAMETERS[5] * (grade - 1)) + 1;
};
const clampStability = (stability: number): number => {
  return Math.max(stability, STABILITY_MIN);
};
const clampDifficulty = (difficulty: number): number => {
  return Math.max(Math.min(difficulty, 10), 1);
};

const shortTermStability = (stability: number, grade: Grade): number => {
  let shortTermStabilityIncrease =
    Math.exp(DEFAULT_PARAMETERS[17] * (grade - 3 + DEFAULT_PARAMETERS[18])) *
    Math.pow(stability, -DEFAULT_PARAMETERS[19]);
  if (grade === Grade.Good || grade === Grade.Easy) {
    shortTermStabilityIncrease = Math.max(shortTermStabilityIncrease, 1.0);
  }
  const shortTermStability = clampStability(stability * shortTermStabilityIncrease);
  return shortTermStability;
};

const linearDamping = (deltaDifficulty: number, difficulty: number): number => {
  return ((10.0 - difficulty) * deltaDifficulty) / 9.0;
};
const meanReversion = (arg_1: number, arg_2: number): number => {
  return DEFAULT_PARAMETERS[7] * arg_1 + (1 - DEFAULT_PARAMETERS[7]) * arg_2;
};
const nextStabilityOnFailure = (
  difficulty: number,
  stability: number,
  retrievability: number
): number => {
  const newStability =
    DEFAULT_PARAMETERS[11] *
    Math.pow(difficulty, -DEFAULT_PARAMETERS[12]) * // more stability lost for difficult cards
    (Math.pow(stability + 1, DEFAULT_PARAMETERS[13]) - 1) * // stable cards lose less stability
    Math.exp((1 - retrievability) * DEFAULT_PARAMETERS[14]);
  const minStability = stability * MIN_S_MUL;
  return Math.min(newStability, minStability);
};
const nextStabilityOnSuccess = (
  difficulty: number,
  stability: number,
  retrievability: number,
  grade: Grade
): number => {
  const hardPenalty = grade === Grade.Hard ? DEFAULT_PARAMETERS[15] : 1;
  const easyBonus = grade === Grade.Easy ? DEFAULT_PARAMETERS[16] : 1;
  const nextStability =
    stability *
    (1 +
      Math.exp(DEFAULT_PARAMETERS[8]) * // learned parameter to control shape of the curve
        (11 - difficulty) * // difficulty penalty
        Math.pow(stability, -DEFAULT_PARAMETERS[9]) * // stability saturates as it gets higher
        (Math.exp((1 - retrievability) * DEFAULT_PARAMETERS[10]) - 1) * // saturation of retrievability
        hardPenalty *
        easyBonus);
  return nextStability;
};
const nextStability = (
  difficulty: number,
  stability: number,
  retrievability: number,
  grade: Grade
): number => {
  let nextStability;
  if (grade === Grade.Again) {
    nextStability = nextStabilityOnFailure(difficulty, stability, retrievability);
  } else {
    nextStability = nextStabilityOnSuccess(difficulty, stability, retrievability, grade);
  }
  return clampStability(nextStability);
};

const nextDifficulty = (difficulty: number, grade: Grade): number => {
  const deltaDifficulty = -DEFAULT_PARAMETERS[6] * (grade - 3);
  const arg_2 = difficulty + linearDamping(deltaDifficulty, difficulty);
  const arg_1 = initialDifficulty(Grade.Easy);
  const nextDifficulty = meanReversion(arg_1, arg_2);
  return clampDifficulty(nextDifficulty);
};

const calcRetrievability = (stability: number, daysSinceLastReview: number | null): number => {
  if (daysSinceLastReview === null) return 0;
  return Math.pow(1 + (FACTOR * daysSinceLastReview) / stability, DECAY);
};

const calcDaysSinceLastReview = (card: Card): number | null => {
  //todo: improve performance
  return card.prevRepeatTime
    ? Math.floor((truncateTime(new Date()) - truncateTime(new Date(card.prevRepeatTime))) / ONE_DAY)
    : null;
};
const calcNextInterval = (stability: number) => {
  let nextInterval = (stability / FACTOR) * (TARGET_RETENTION ** (1 / DECAY) - 1);
  nextInterval = Math.round(nextInterval);
  nextInterval = Math.max(nextInterval, 1);
  nextInterval = Math.min(nextInterval, MAX_INTERVAL);
  return nextInterval;
};
const fsrsScheduler = (learningSteps: number[], reLearningSteps: number[]) => {
  const reviewLearningCard = (card: Card, daysSinceLastReview: number | null, grade: Grade) => {
    if (card.stability === null || card.difficulty === null) {
      card.stability = clampStability(initialStability(grade));
      card.difficulty = clampDifficulty(initialDifficulty(grade));
    } else if (daysSinceLastReview !== null && daysSinceLastReview < 1) {
      card.stability = shortTermStability(card.stability, grade);
      card.difficulty = nextDifficulty(card.difficulty, grade);
    } else {
      const retrievability = calcRetrievability(card.stability, daysSinceLastReview);
      card.stability = nextStability(card.difficulty, card.stability, retrievability, grade);
      card.difficulty = nextDifficulty(card.difficulty, grade);
    }
    //TODO: learning steps edge cases
    if (
      learningSteps.length === 0 ||
      (card.learningStep >= learningSteps.length &&
        (grade === Grade.Hard || grade === Grade.Good || grade === Grade.Easy))
    ) {
      card.status = CardStatus.Review;
      card.learningStep = 0;
      const interval = calcNextInterval(card.stability) * ONE_DAY;
      card.repeatTime = Date.now() + interval;
    } else {
      let nextInterval;
      switch (grade) {
        case Grade.Again:
          card.learningStep = 0;
          nextInterval = learningSteps[0];
          break;
        case Grade.Hard:
          // HARD -> don't increment learning step
          if (card.learningStep == 0) {
            if (learningSteps.length == 1) {
              nextInterval = learningSteps[0] * 1.5;
            } else {
              nextInterval = (learningSteps[0] + learningSteps[1]) * 0.5;
            }
          } else {
            nextInterval = learningSteps[card.learningStep];
          }
          break;
        case Grade.Good:
          if (card.learningStep == learningSteps.length - 1) {
            card.status = CardStatus.Review;
            card.learningStep = 0;
            nextInterval = calcNextInterval(card.stability) * ONE_DAY;
          } else {
            card.learningStep += 1;
            nextInterval = learningSteps[card.learningStep];
          }
          break;
        case Grade.Easy:
          card.status = CardStatus.Review;
          card.learningStep = 0;
          nextInterval = calcNextInterval(card.stability) * ONE_DAY;
          break;
      }
      card.repeatTime = Date.now() + nextInterval;
    }
  };
  const reviewReviewCard = (card: Card, daysSinceLastReview: number | null, grade: Grade) => {
    if (daysSinceLastReview !== null && daysSinceLastReview < 1) {
      card.stability = shortTermStability(card.stability, grade);
      card.difficulty = nextDifficulty(card.difficulty, grade);
    } else {
      const retrievability = calcRetrievability(card.stability, daysSinceLastReview);
      card.stability = nextStability(card.difficulty, card.stability, retrievability, grade);
      card.difficulty = nextDifficulty(card.difficulty, grade);
    }
    let nextInterval;
    switch (grade) {
      case Grade.Again:
        if (learningSteps.length === 0) {
          nextInterval = calcNextInterval(card.stability) * ONE_DAY;
        } else {
          card.status = CardStatus.Relearning;
          card.learningStep = 0;
          nextInterval = reLearningSteps[0];
        }
        break;
      case Grade.Hard:
      case Grade.Good:
      case Grade.Easy:
        card.status = CardStatus.Review;
        nextInterval = calcNextInterval(card.stability) * ONE_DAY;
        break;
    }
    card.repeatTime = Date.now() + nextInterval;
  };
  const reviewRelearningCard = (card: Card, daysSinceLastReview: number | null, grade: Grade) => {
    if (daysSinceLastReview !== null && daysSinceLastReview < 1) {
      card.stability = shortTermStability(card.stability, grade);
      card.difficulty = nextDifficulty(card.difficulty, grade);
    } else {
      const retrievability = calcRetrievability(card.stability, daysSinceLastReview);
      card.stability = nextStability(card.difficulty, card.stability, retrievability, grade);
      card.difficulty = nextDifficulty(card.difficulty, grade);
    }
    if (
      reLearningSteps.length === 0 ||
      (card.learningStep >= reLearningSteps.length &&
        (grade === Grade.Hard || grade === Grade.Good || grade === Grade.Easy))
    ) {
      card.status = CardStatus.Review;
      card.learningStep = 0;
      const interval = calcNextInterval(card.stability) * ONE_DAY;
      card.repeatTime = Date.now() + interval;
    } else {
      let nextInterval;
      switch (grade) {
        case Grade.Again:
          card.learningStep = 0;
          nextInterval = reLearningSteps[0];
          break;
        case Grade.Hard:
          // HARD -> don't increment learning step
          if (card.learningStep == 0) {
            if (reLearningSteps.length == 1) {
              nextInterval = reLearningSteps[0] * 1.5;
            } else {
              nextInterval = (reLearningSteps[0] + reLearningSteps[1]) * 0.5;
            }
          } else {
            nextInterval = reLearningSteps[card.learningStep];
          }
          break;
        case Grade.Good:
          if (card.learningStep == reLearningSteps.length - 1) {
            card.status = CardStatus.Review;
            card.learningStep = 0;
            nextInterval = calcNextInterval(card.stability) * ONE_DAY;
          } else {
            card.learningStep += 1;
            nextInterval = reLearningSteps[card.learningStep];
          }
          break;
        case Grade.Easy:
          card.status = CardStatus.Review;
          card.learningStep = 0;
          nextInterval = calcNextInterval(card.stability) * ONE_DAY;
          break;
      }
      card.repeatTime = Date.now() + nextInterval;
    }
  };
  const reviewCard = (card: Card, grade: Grade) => {
    const daysSinceLastReview = calcDaysSinceLastReview(card);
    switch (card.status) {
      case CardStatus.New:
      case CardStatus.Learning:
        reviewLearningCard(card, daysSinceLastReview, grade);
        break;
      case CardStatus.Review:
        reviewReviewCard(card, daysSinceLastReview, grade);
        break;
      case CardStatus.Relearning:
        reviewRelearningCard(card, daysSinceLastReview, grade);
        break;
    }
    card.prevRepeatTime = Date.now();
  };

  return {
    reviewCard,
  };
};

export { Grade, fsrsScheduler };
