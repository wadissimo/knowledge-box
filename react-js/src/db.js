// db.js
import { openDB } from "idb";

const dbPromise = openDB("flashcards-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("cards")) {
      const store = db.createObjectStore("cards", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("front", "front", { unique: false });
      store.createIndex("back", "back", { unique: false });
      store.createIndex("date", "date", { unique: false });
    }
  },
});

export const addCard = async (card) => {
  const db = await dbPromise;
  await db.add("cards", card);
};

export const getAllCards = async () => {
  const db = await dbPromise;
  return await db.getAll("cards");
};

export const updateCard = async (id, updatedCard) => {
  const db = await dbPromise;
  const tx = db.transaction("cards", "readwrite");
  const store = tx.objectStore("cards");
  const card = await store.get(id);
  Object.assign(card, updatedCard);
  await store.put(card);
  await tx.done;
};
