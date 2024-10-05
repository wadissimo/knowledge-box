import * as SQLite from "expo-sqlite";
import { Collection } from "./CollectionModel";

type BoxCollection = {
  boxId: number;
  collectionId: number;
};

function useBoxCollectionModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newBoxCollection = async (boxId: number, collectionId: number) => {
    await db.runAsync(
      "INSERT INTO boxCollections (boxId, collectionId) VALUES (?, ?)",
      boxId,
      collectionId
    );
    //const lastIdResult = await db.queryAsync("SELECT last_insert_rowid() AS id");
  };

  // Delete
  const deleteBoxCollection = async (boxId: number, collectionId: number) => {
    await db.runAsync(
      "DELETE FROM boxCollections where boxId=?, collectionId=?",
      boxId,
      collectionId
    );
  };

  // Read

  const fetchBoxCollections = async (
    boxId: number
  ): Promise<BoxCollection[]> => {
    return await db.getAllAsync<BoxCollection>(
      "SELECT * FROM boxCollections where boxId = ?",
      boxId
    );
  };

  const fetchCollectionsByBoxId = async (
    boxId: number
  ): Promise<Collection[]> => {
    return await db.getAllAsync<Collection>(
      "SELECT * FROM collections inner join boxCollections on collections.id = boxCollections.collectionId where boxId=? ",
      boxId
    );
  };

  return {
    newBoxCollection,
    deleteBoxCollection,
    fetchBoxCollections,
    fetchCollectionsByBoxId,
  };
}

export { BoxCollection, useBoxCollectionModel };
