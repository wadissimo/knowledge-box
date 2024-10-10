import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import { Card, useCardModel } from "@/data/CardModel";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import * as SQLite from "expo-sqlite";
import { useState } from "react";

export default function useCollectionRemoteService() {
  const { newCollection } = useCollectionModel();
  const { newBoxCollection } = useBoxCollectionModel();
  const { newCards } = useCardModel();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //const db = SQLite.useSQLiteContext();

  async function searchCollections(
    searchQuery: string
  ): Promise<Collection[] | null> {
    try {
      const URL =
        process.env.EXPO_PUBLIC_API_URL +
        "collections/search?" +
        new URLSearchParams({
          query: searchQuery,
        });

      const res = await fetch(URL);
      const data = await res.json();
      if (!data || !data.results) {
        throw Error("Network Error");
      }
      return data.results as Collection[];
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function getCollectionPreview(
    collectionId: number
  ): Promise<{ collection: Collection; cards: Card[] } | null> {
    setLoading(true);
    setError(null);
    try {
      const URL =
        process.env.EXPO_PUBLIC_API_URL + "collections/preview/" + collectionId;

      const res = await fetch(URL);
      const data = await res.json();
      if (data && data.collection && data.cards) {
        return {
          collection: data.collection as Collection,
          cards: data.cards as Card[],
        };
      }
      return null;
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function addCollection(
    boxId: number,
    collectionId: number
  ): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const URL =
        process.env.EXPO_PUBLIC_API_URL +
        "collections/download/" +
        collectionId;

      const res = await fetch(URL);
      const data = await res.json();

      if (data && data.collection && data.cards) {
        const collection = data.collection;

        const newColId = await newCollection(
          collection.name,
          collection.description,
          collection.tags,
          collection.cardsNumber,
          collection.createdBy
        );
        await newBoxCollection(boxId, newColId);
        const cards = (data.cards as Card[]).map((card) => ({
          collectionId: newColId,
          front: card.front,
          back: card.back,
          frontImg: card.frontImg ? -card.frontImg : null, // Important: update global id to "-", positive values would be local ids
          backImg: card.backImg ? -card.backImg : null, // Important: update global id to "-", positive values would be local ids
          frontSound: card.frontSound ? -card.frontSound : null, // Important: update global id to "-", positive values would be local ids
          backSound: card.backSound ? -card.backSound : null, // Important: update global id to "-", positive values would be local ids
          initialEaseFactor: card.initialEaseFactor,
        }));
        await newCards(cards);
        //TODO: sync media if needed too
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    getCollectionPreview,
    addCollection,
    searchCollections,
  };
}
