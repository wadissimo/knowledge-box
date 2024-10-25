import * as SQLite from "expo-sqlite";

type Collection = {
  id: number;
  name: string;
  description: string | null;
  tags: string | null;
  cardsNumber: number;
  createdBy: string | null;
  createdAt: number;
};

type CollectionTrainingData = {
  collectionId: number;
  maxNewCards: number;
  maxReviewCards: number;
  maxLearningCards: number;
  totalCardViews: number;
  totalSuccessResponses: number;
  totalFailedResponses: number;
  totalScore: number;
  streak: number;
  lastTrainingDate: number | null;
};

function useCollectionModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newCollection = async (
    name: string,
    description: string | null,
    tags: string | null,
    cardsNumber: number,
    createdBy: string | null
  ): Promise<number> => {
    var collectionId = null;
    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        "INSERT INTO collections (name, description, tags, cardsNumber, createdBy) VALUES (?, ?, ?, ?, ?)",
        name,
        description,
        tags,
        cardsNumber,
        createdBy
      );
      collectionId = result.lastInsertRowId;
      await newCollectionTrainingData(collectionId);
    });
    if (collectionId === null) throw new Error("error creating collection");
    return collectionId;
  };

  const newCollectionTrainingData = async (
    collectionId: number,
    maxNewCards: number = 5,
    maxReviewCards: number = 100,
    maxLearningCards: number = 100,
    totalCardViews: number = 0,
    totalSuccessResponses: number = 0,
    totalFailedResponses: number = 0,
    totalScore: number = 0,
    streak: number = 0,
    lastTrainingDate: number | null = null
  ): Promise<void> => {
    await db.runAsync(
      `INSERT INTO collectionTrainingData (collectionId, maxNewCards, maxReviewCards, maxLearningCards,
       totalCardViews, totalSuccessResponses, totalFailedResponses, totalScore, streak, lastTrainingDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      collectionId,
      maxNewCards,
      maxReviewCards,
      maxLearningCards,
      totalCardViews,
      totalSuccessResponses,
      totalFailedResponses,
      totalScore,
      streak,
      lastTrainingDate
    );
  };

  // Update
  const updateCollectionTrainingData = async (
    trainingData: CollectionTrainingData
  ) => {
    await db.runAsync(
      `UPDATE collectionTrainingData SET maxNewCards = ?, maxReviewCards = ?, maxLearningCards = ?,
       totalCardViews=?, totalSuccessResponses = ?, totalFailedResponses=?, totalScore = ?,
       streak=?, lastTrainingDate = ? where collectionId=?`,
      trainingData.maxNewCards,
      trainingData.maxReviewCards,
      trainingData.maxLearningCards,
      trainingData.totalCardViews,
      trainingData.totalSuccessResponses,
      trainingData.totalFailedResponses,
      trainingData.totalScore,
      trainingData.streak,
      trainingData.lastTrainingDate,
      trainingData.collectionId
    );
  };
  const updateCollection = async (collection: Collection) => {
    await db.runAsync(
      "UPDATE collections SET name = ?, description = ?, tags = ?, cardsNumber=?, createdBy = ? where id=?",
      collection.name,
      collection.description,
      collection.tags,
      collection.cardsNumber,
      collection.createdBy,
      collection.id
    );
  };

  // Delete
  const deleteCollection = async (id: number) => {
    await db.runAsync("DELETE FROM collections where id=?", id);
  };

  // Read

  const fetchCollections = async (): Promise<Collection[]> => {
    return await db.getAllAsync<Collection>("SELECT * FROM collections");
  };

  const getCollectionById = async (id: number): Promise<Collection | null> => {
    return await db.getFirstAsync<Collection>(
      "SELECT * FROM collections where id=? ",
      id
    );
  };

  const getCollectionTrainingData = async (
    collectionId: number
  ): Promise<CollectionTrainingData | null> => {
    return await db.getFirstAsync<CollectionTrainingData>(
      "SELECT * from collectionTrainingData where collectionId = ?",
      collectionId
    );
  };

  return {
    newCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    fetchCollections,
    newCollectionTrainingData,
    updateCollectionTrainingData,
    getCollectionTrainingData,
  };
}

export { Collection, useCollectionModel };
