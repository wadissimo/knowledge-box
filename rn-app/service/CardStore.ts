import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseAsync("cards.db");

export type Card = {
  id: number;
  front: string;
  back: string;
  collectionId: number;
  createdAt: string;
};

export type Collection = {
  id: number;
  name: string;
  createdAt: string;
};

// // Initialize the database tables
// export const initDB = () => {
//   db.execAsync(`
//       CREATE TABLE IF NOT EXISTS collections (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL,
//         createdAt TEXT DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//   // Cards table
//   db.execSync(`
//       CREATE TABLE IF NOT EXISTS cards (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         front TEXT NOT NULL,
//         back TEXT NOT NULL,
//         collectionId INTEGER,
//         createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
//       );
//     `);
// };

// // Fetch all collections
// export const fetchCollections = (): Promise<Collection[]> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM collections",
//         [],
//         (_, { rows }) => resolve(rows._array),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // Fetch cards by collection
// export const fetchCardsByCollection = (
//   collectionId: number
// ): Promise<Card[]> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM cards WHERE collectionId = ?",
//         [collectionId],
//         (_, { rows }) => resolve(rows._array),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // Add a new collection
// export const addCollection = (name: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "INSERT INTO collections (name) VALUES (?)",
//         [name],
//         () => resolve(),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // Update a collection
// export const updateCollection = (id: number, name: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "UPDATE collections SET name = ? WHERE id = ?",
//         [name, id],
//         () => resolve(),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // Delete a collection and all its cards
// export const deleteCollection = (id: number): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "DELETE FROM collections WHERE id = ?",
//         [id],
//         () => resolve(),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // Add a new card to a collection
// export const addCardToCollection = (
//   front: string,
//   back: string,
//   collectionId: number
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "INSERT INTO cards (front, back, collectionId) VALUES (?, ?, ?)",
//         [front, back, collectionId],
//         () => resolve(),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // Update a card
// export const updateCard = (
//   id: number,
//   front: string,
//   back: string
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "UPDATE cards SET front = ?, back = ? WHERE id = ?",
//         [front, back, id],
//         () => resolve(),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };

// // Delete a card
// export const deleteCard = (id: number): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "DELETE FROM cards WHERE id = ?",
//         [id],
//         () => resolve(),
//         (_, error) => reject(error)
//       );
//     });
//   });
// };
