import { createContext, useContext, useEffect, useState } from "react";
import Card from "../data/Card";
import { v4 as uuidv4 } from "uuid";

const CollectionContext = createContext();

const fakeCollections = [
  {
    id: 1,
    name: "Collection 1",
    cards: [
      new Card(uuidv4(), "Card 1 Front", "Card 1 Back🤦‍♀️"),
      new Card(uuidv4(), "Card 2 Front", "Card 2 Back"),
    ],
  },
  {
    id: 2,
    name: "Collection 2",
    cards: [
      new Card(uuidv4(), "Card 3 Front", "Card 3 Back"),
      new Card(uuidv4(), "Card 4 Front", "Card 4 Back"),
    ],
  },
];

const API_BASE_URL = "http://localhost:8010/collections";

function CollectionProvider({ children }) {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then((response) => response.json())
      .then((data) => {
        setCollections(data);
      });
  }, []);

  // Add
  function addCollection(newCollection) {
    console.log("addCollection", newCollection);
    setCollections((collections) => [...collections, newCollection]);
  }
  // Update
  function updateCollection(updatedCollection) {
    console.log("updateCollection", updatedCollection);
    setCollections((collections) =>
      collections.map((collection) =>
        collection.id === updatedCollection.id ? updatedCollection : collection
      )
    );
  }
  // Delete
  function deleteCollection(id) {
    console.log("deleteCollection", id);
    setCollections((collections) => collections.filter((col) => col.id !== id));
  }
  return (
    <CollectionContext.Provider
      value={{
        collections,
        addCollection,
        updateCollection,
        deleteCollection,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

function useCollections() {
  const context = useContext(CollectionContext);
  return context;
}

export { CollectionProvider, useCollections };
