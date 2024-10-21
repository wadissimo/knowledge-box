import { Card } from "@/src/data/CardModel";

export interface Trainer {
  getName(): string;

  getDescription(): string;

  // Initializes a new training session
  initSession(): void;

  // Loads an existing session (e.g., for resuming progress)
  loadSession(sessionData: any): void;

  // Retrieves the next card to show to the user
  getNextCard(): Card | null;

  // Processes the user's response for a card
  processUserResponse(response: string): void;

  //   // Additional methods or properties
  //   getSessionStatus?(): SessionStatus;
  //   saveSession?(): any;
}
