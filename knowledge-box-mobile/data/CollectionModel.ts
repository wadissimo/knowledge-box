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
    const result = await db.runAsync(
      "INSERT INTO collections (name, description, tags, cardsNumber, createdBy) VALUES (?, ?, ?, ?, ?)",
      name,
      description,
      tags,
      cardsNumber,
      createdBy
    );
    return result.lastInsertRowId;
  };

  // Update
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

  return {
    newCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    fetchCollections,
  };
}

export { Collection, useCollectionModel };
