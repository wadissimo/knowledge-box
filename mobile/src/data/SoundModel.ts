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
    ref: string | null = null,
    comment: string | null = null
  ): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO sounds (file, ref, comment) VALUES (?, ?, ?)",
      file,
      ref,
      comment
    );
    return result.lastInsertRowId;
  };

  const newSoundWithId = async (
    id: number,
    file: string,
    ref: string | null,
    comment: string | null
  ): Promise<void> => {
    const result = await db.runAsync(
      "INSERT INTO sounds (id, file, ref, comment) VALUES (?, ?, ?, ?)",
      id,
      file,
      ref,
      comment
    );
  };

  // Update
  const updateSound = async (sound: SoundData): Promise<void> => {
    await db.runAsync(
      "UPDATE sounds SET file = ?, ref = ?, comment = ? where id=?",
      sound.file,
      sound.ref,
      sound.comment,
      sound.id
    );
  };

  // Delete
  const deleteSound = async (id: number): Promise<void> => {
    await db.runAsync("DELETE FROM sounds where id=?", id);
  };

  // Read
  const getSoundById = async (id: number): Promise<SoundData | null> => {
    const res = await db.getFirstAsync<SoundData>(
      "select * FROM sounds where id=?",
      id
    );
    return res;
  };

  return { newSound, updateSound, deleteSound, newSoundWithId, getSoundById };
}

export { SoundData, useSoundModel };
