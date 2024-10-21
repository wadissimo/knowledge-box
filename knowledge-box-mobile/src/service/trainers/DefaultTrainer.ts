import { Card } from "@/src/data/CardModel";
import { Trainer } from "./Trainer";
import { i18n } from "@/src/lib/i18n";

class DefaultTrainer implements Trainer {
  maxNewCards: number;
  maxReviewCards: number;
  maxLearningCards: number;

  constructor(
    maxNewCards: number,
    maxReviewCards: number,
    maxLearningCards: number
  ) {
    this.maxNewCards = maxNewCards;
    this.maxReviewCards = maxReviewCards;
    this.maxLearningCards = maxLearningCards;
  }

  getName(): string {
    return i18n.t("trainer.defaultTrainerName");
  }
  getDescription(): string {
    return i18n.t("trainer.defaultTrainerDescription");
  }

  initSession(): void {
    throw new Error("Method not implemented.");
  }
  loadSession(sessionData: any): void {
    throw new Error("Method not implemented.");
  }
  getNextCard(): Card | null {
    throw new Error("Method not implemented.");
  }
  processUserResponse(response: string): void {
    throw new Error("Method not implemented.");
  }
}
