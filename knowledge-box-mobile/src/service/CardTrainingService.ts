import * as SQLite from "expo-sqlite";
import { Card } from "../data/CardModel";

function useCardTrainingService() {
  const db = SQLite.useSQLiteContext();

  const updateCardRepeatTime = async (cardId: number, repeatTime: string) => {
    await db.runAsync(
      "UPDATE cards SET repeatTime = ? where id=?",
      repeatTime,
      cardId
    );
  };

  const selectNewTrainingCards = async (
    collectionId: number,
    numberOfCards: number
  ) => {
    const result = await db.getAllAsync<Card>(
      "SELECT * FROM cards where collectionId=? and repeatTime is null order by id asc limit ?",
      collectionId,
      numberOfCards
    );
    return result;
  };

  const selectToRepeatTrainingCards = async (
    collectionId: number,
    time: number
  ) => {
    const result = await db.getAllAsync<Card>(
      "SELECT * FROM cards where collectionId = ? and repeatTime <= ?",
      collectionId,
      time
    );
    return result;
  };

  return {
    updateCardRepeatTime,
    selectNewTrainingCards,
    selectToRepeatTrainingCards,
  };
}

export { useCardTrainingService };
