import * as SQLite from "expo-sqlite";

// id INTEGER PRIMARY KEY AUTOINCREMENT,
// 				 title TEXT,
//                  content TEXT,
// 				 theme TEXT,
// 				 type INTEGER DEFAULT 0,
// 				 hide INTEGER DEFAULT 0,
// 				 priority INTEGER DEFAULT 0,
//                  createdAt INTEGER DEFAULT CURRENT_TIMESTAMP

type Note = {
  id: number;
  title: string;
  content: string;
  theme: string;
  type: number;
  hide: boolean;
  priority: number;
  createdAt: number;
};

type BoxNote = {
  boxId: number;
  noteId: number;
};

const useNoteModel = () => {
  const db = SQLite.useSQLiteContext();

  // Create
  const newNote = async (
    title: string,
    content: string,
    theme: string,
    type: number = 0,
    hide: boolean = true,
    priority: number = 0
  ): Promise<number> => {
    const result = await db.runAsync(
      "INSERT INTO notes (title, content, theme, type, hide, priority) VALUES (?, ?, ?, ?, ?, ?)",
      title,
      content,
      theme,
      type,
      hide ? 1 : 0,
      priority
    );
    return result.lastInsertRowId;
  };
  const newBoxNote = async (boxId: number, noteId: number): Promise<void> => {
    await db.runAsync(
      "INSERT INTO boxNotes (boxId, noteId) VALUES (?,?)",
      boxId,
      noteId
    );
  };

  // Update
  const updateNote = async (note: Note): Promise<void> => {
    await db.runAsync(
      "UPDATE notes SET title = ?, content = ?, theme = ?, type = ?, hide = ?, priority = ?  WHERE id = ?",
      note.title,
      note.content,
      note.theme,
      note.type,
      note.hide ? 1 : 0,
      note.priority,
      note.id
    );
  };

  // Delete
  const deleteNote = async (id: number): Promise<void> => {
    await db.withTransactionAsync(async () => {
      await db.runAsync("DELETE from notes where id = ?", id);
      await db.runAsync("DELETE from boxNotes where noteId = ?", id);
    });
  };

  // Read
  const getNoteById = async (noteId: number): Promise<Note | null> => {
    const res = db.getFirstAsync<Note>(
      "SELECT * FROM notes where id = ?",
      noteId
    );
    return res;
  };

  const getBoxNotes = async (boxId: number): Promise<Note[]> => {
    return db.getAllAsync<Note>(
      "SELECT * FROM notes INNER JOIN boxNotes ON (notes.id = boxNotes.noteId) WHERE boxNotes.boxId = ?",
      boxId
    );
  };

  return {
    newNote,
    newBoxNote,
    updateNote,
    deleteNote,
    getNoteById,
    getBoxNotes,
  };
};

export { Note, BoxNote, useNoteModel };
