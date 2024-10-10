import * as SQLite from "expo-sqlite";

type SoundData = {
  id: number;
  file: string;
  ref: string | null;
  comment: string | null;
};

function useSoundModel() {
  const db = SQLite.useSQLiteContext();

  // Create
  const newSound = async (
    file: string,
    ref: string | null,
    comment: string | null
  ): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO sounds (file, ref, comment) VALUES (?, ?, ?)",
      file,
      ref,
      comment
    );
    return result.lastInsertRowId;
  };

  // Update
  const updateSound = async (sound: SoundData) => {
    await db.runAsync(
      "UPDATE sounds SET file = ?, ref = ?, comment = ? where id=?",
      sound.file,
      sound.ref,
      sound.comment,
      sound.id
    );
  };

  // Delete
  const deleteSound = async (id: number) => {
    await db.runAsync("DELETE FROM sounds where id=?", id);
  };

  // Read

  return {
    newSound,
    updateSound,
    deleteSound,
  };
}

export { SoundData, useSoundModel };
