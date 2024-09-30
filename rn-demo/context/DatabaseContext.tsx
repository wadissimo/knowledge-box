import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import * as SQLite from "expo-sqlite";

// Define Collection type
type Collection = {
  id: number;
  name: string;
  cardsNumber: number;
  createdAt: string;
};

type Card = {
  id: number;
  front: string;
  back: string;
  collectionId: number;
  createdAt?: string | null;
  repeatTime?: string | null;
};

// Define the context's type (what values it will provide)
interface CollectionContextProps {
  collections: Collection[] | undefined;
  newCollection: Function;
  updateCollection: Function;
  deleteCollection: Function;
  getCollectionById: Function;
  getCards: Function;
  newCard: Function;
  updateCardFrontBack: Function;
  getCardById: Function;
  deleteCard: Function;
}

// Create the context with an empty initial value
const CollectionContext = createContext<CollectionContextProps>({
  collections: undefined,
  newCollection: () => {},
  updateCollection: () => {},
  deleteCollection: () => {},
  getCollectionById: () => {},
  getCards: () => {},
  newCard: () => {},
  updateCardFrontBack: () => {},
  getCardById: () => {},
  deleteCard: () => {},
});

// Define the provider's props, including the children prop
interface CollectionProviderProps {
  children: ReactNode;
}

const CollectionProvider = ({ children }: CollectionProviderProps) => {
  const [collections, setCollections] = useState<Collection[]>();
  const db = SQLite.useSQLiteContext();
  // const collections = [
  //   { id: "1", name: "Math", cardsNumber: 20 },
  //   { id: "2", name: "History", cardsNumber: 30 },
  // ];
  //const [collections, setCollections] = useState<Collection[]>([]);

  const fetchCollections = async () => {
    const result = await db.getAllAsync<Collection>(
      "SELECT * FROM collections"
    );
    setCollections(result);
  };

  useEffect(() => {
    async function setup() {
      try {
        console.log("setup start");
        const DATABASE_VERSION = 4;
        let res = await db.getFirstAsync<{
          user_version: number;
        }>("PRAGMA user_version");

        if (res && res.user_version >= DATABASE_VERSION) {
          return;
        }

        await db.execAsync(`DROP TABLE IF EXISTS collections;`);
        await db.execAsync(`CREATE TABLE IF NOT EXISTS collections (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         cardsNumber INTEGER,
         createdAt TEXT DEFAULT CURRENT_TIMESTAMP
       );`);
        console.log("cards table created");
        await db.execAsync(`DROP TABLE IF EXISTS cards;`);
        console.log("cards table dropped");
        await db.execAsync(`CREATE TABLE IF NOT EXISTS cards (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 collectionId INTEGER,
                 front TEXT NOT NULL,
                 back TEXT NOT NULL,
                 createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                 repeatTime TEXT,
                 FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE);`);
        console.log("tables created");
        //Insert Dummy records
        await db.runAsync(
          "INSERT INTO collections (name, cardsNumber) VALUES ( ?, ?)",

          "Capitals",
          3
        );
        console.log("collection create");

        await db.runAsync(
          "INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)",
          1,
          "Germany",
          "Berlin"
        );
        await db.runAsync(
          "INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)",
          1,
          "Spain",
          "Madrid"
        );
        await db.runAsync(
          "INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)",
          1,
          "Italy",
          "Rome"
        );

        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
      } catch (error) {
        console.error(error);
      }
    }

    async function fetchData() {
      await setup();
      await fetchCollections();
    }

    fetchData();
  }, []);

  const newCollection = async (name: string) => {
    await db.runAsync(
      "INSERT INTO collections (name, cardsNumber) VALUES (?, ?)",
      name,
      0
    );
    await fetchCollections();
  };

  const updateCollection = async (id: number, name: string) => {
    await db.runAsync("UPDATE collections SET name = ? where id=?", name, id);
    await fetchCollections();
  };

  const deleteCollection = async (id: number) => {
    await db.runAsync("DELETE FROM collections where id=?", id);
    await fetchCollections();
  };

  const getCollectionById = async (id: number) => {
    const result = await db.getAllAsync<Collection>(
      "SELECT * FROM collections where id=? ",
      id
    );
    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  };

  const getCards = async (collectionId: number) => {
    const result = await db.getAllAsync<Card>(
      "SELECT * FROM cards where collectionId=? ",
      collectionId
    );
    return result;
  };

  const getCardById = async (cardId: number) => {
    const result = await db.getAllAsync<Card>(
      "SELECT * FROM cards where id=? ",
      cardId
    );
    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  };

  const newCard = async (collectionId: number, front: string, back: string) => {
    await db.runAsync(
      "INSERT INTO cards (collectionId, front, back) VALUES (?, ?, ?)",
      collectionId,
      front,
      back
    );
    //todo update collection count
    await fetchCollections();
  };

  const updateCardFrontBack = async (
    cardId: number,
    front: string,
    back: string
  ) => {
    await db.runAsync(
      "UPDATE cards SET front = ?, back = ? where id=?",
      front,
      back,
      cardId
    );
    await fetchCollections();
  };

  const deleteCard = async (cardId: number) => {
    await db.runAsync("DELETE FROM cards where id=?", cardId);
    await fetchCollections();
  };

  return (
    <CollectionContext.Provider
      value={{
        collections,
        newCollection,
        updateCollection,
        deleteCollection,
        getCollectionById,
        getCards,
        newCard,
        updateCardFrontBack,
        getCardById,
        deleteCard,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

function useDatabase() {
  const context = useContext(CollectionContext);
  return context;
}

export {
  CollectionProvider,
  useDatabase,
  Collection,
  CollectionContextProps,
  Card,
};
