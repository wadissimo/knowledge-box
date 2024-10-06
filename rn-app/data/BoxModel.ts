import * as SQLite from "expo-sqlite";

type Box = {
  id: number;
  name: string;
  description: string | null;
  favourite: boolean;
  public: boolean;
  createdBy: string | null;
  parentId: number | null;
  createdAt: number;
};

function useBoxModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newBox = async (
    name: string,
    description: string | null,
    parentId: number | null
  ): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO boxes (name, description, parentId) VALUES (?, ?, ?)",
      name,
      description,
      parentId
    );
    return result.lastInsertRowId;
  };

  // Update
  const updateBox = async (box: Box) => {
    await db.runAsync(
      "UPDATE boxes SET name = ?, description = ?, favourite = ?, public = ?, createdBy = ?, parentId = ? where id=?",
      box.name,
      box.description,
      box.favourite,
      box.public,
      box.createdBy,
      box.parentId,
      box.id
    );
  };

  // Delete
  const deleteBox = async (id: number) => {
    await db.runAsync("DELETE FROM boxes where id=?", id);
  };

  // Read

  const fetchBoxes = async (): Promise<Box[]> => {
    return await db.getAllAsync<Box>("SELECT * FROM boxes");
  };

  const getBoxById = async (id: number): Promise<Box | null> => {
    return await db.getFirstAsync<Box>("SELECT * FROM boxes where id=? ", id);
  };

  return {
    newBox,
    updateBox,
    deleteBox,
    getBoxById,
    fetchBoxes,
  };
}

export { Box, useBoxModel };
