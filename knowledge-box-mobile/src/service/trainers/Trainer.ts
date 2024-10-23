import { Card } from "@/src/data/CardModel";
import { Session } from "@/src/data/SessionModel";

export interface Trainer {
  getName(): string;

  getDescription(): string;

  getSession(key: string): Promise<Session | null>;

  createSession(key: string): Promise<Session>;

  // Retrieves the next card to show to the user
  getNextCard(sessionId: number): Promise<Card | null>;

  // Processes the user's response for a card
  processUserResponse(
    sessionId: number,
    card: Card,
    response: string,
    sessionCards?: Card[]
  ): Promise<void>;

  //   // Additional methods or properties
  //   getSessionStatus?(): SessionStatus;
  //   saveSession?(): any;
}
