import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import * as SQLite from "expo-sqlite";
import { Collection } from "@/data/CollectionModel";
import { Card } from "@/data/CardModel";

interface CollectionContextProps {
  collections: Collection[];
}

const CollectionContext = createContext<CollectionContextProps>({
  collections: [],
});

interface CollectionProviderProps {
  children: ReactNode;
}

const CollectionProvider = ({ children }: CollectionProviderProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const db = SQLite.useSQLiteContext();

  return (
    <CollectionContext.Provider
      value={{
        collections,
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

export { CollectionProvider, useDatabase };
