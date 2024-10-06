import * as SQLite from "expo-sqlite";

type Collection = {
  id: number;
  name: string;
  cardsNumber: number;
  createdAt: number;
};

function useCollectionModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newCollection = async (name: string): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO collections (name, cardsNumber) VALUES (?, ?)",
      name,
      0
    );
    return result.lastInsertRowId;
  };

  // Update
  const updateCollection = async (collection: Collection) => {
    await db.runAsync(
      "UPDATE collections SET name = ?, cardsNumber=? where id=?",
      collection.name,
      collection.cardsNumber,
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

  return {
    newCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    fetchCollections,
  };
}

export { Collection, useCollectionModel };
