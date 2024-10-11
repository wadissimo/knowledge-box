import * as SQLite from "expo-sqlite";

type ImageData = {
  id: number;
  file: string;
  ref: string | null;
  comment: string | null;
};

function useImageModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newImage = async (
    file: string,
    ref: string | null,
    comment: string | null
  ): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO images (file, ref, comment) VALUES (?, ?, ?)",
      file,
      ref,
      comment
    );
    return result.lastInsertRowId;
  };

  const newImageWithId = async (
    id: number,
    file: string,
    ref: string | null,
    comment: string | null
  ): Promise<void> => {
    const result = await db.runAsync(
      "INSERT INTO images (id, file, ref, comment) VALUES (?, ?, ?, ?)",
      id,
      file,
      ref,
      comment
    );
  };

  // Update
  const updateImage = async (image: ImageData) => {
    await db.runAsync(
      "UPDATE images SET file = ?, ref = ?, comment = ? where id=?",
      image.file,
      image.ref,
      image.comment,
      image.id
    );
  };

  // Delete
  const deleteImage = async (id: number) => {
    await db.runAsync("DELETE FROM images where id=?", id);
  };

  // Read
  const getImageById = async (id: number): Promise<ImageData | null> => {
    const res = await db.getFirstAsync<ImageData>(
      "select * FROM images where id=?",
      id
    );
    return res;
  };

  return {
    newImage,
    updateImage,
    deleteImage,
    getImageById,
    newImageWithId,
  };
}

export { ImageData, useImageModel };
