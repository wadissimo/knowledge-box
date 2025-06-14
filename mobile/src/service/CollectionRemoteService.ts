import { useBoxCollectionModel } from '@/src/data/BoxCollectionModel';
import { Card, useCardModel } from '@/src/data/CardModel';
import { Collection, useCollectionModel } from '@/src/data/CollectionModel';
import { useState } from 'react';

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? '';
export type ServerGroup = {
  id: number;
  name: string;
  description: string;
};
export type ServerCollectionGroup = {
  collection_id: number;
  group_id: number;
};
export type CollectionGroup = {
  collectionId: number;
  groupId: number;
};
export type ServerCollection = {
  id: number;
  name: string;
  description: string;
  tags: string;
  cardsNumber: number;
  createdBy: string;
  createdAt: number;
};
export function convertServerCollectionGroup(
  serverCollectionGroup: ServerCollectionGroup
): CollectionGroup {
  return {
    collectionId: serverCollectionGroup.collection_id,
    groupId: serverCollectionGroup.group_id,
  };
}
export function convertServerCollection(serverCollection: ServerCollection): Collection {
  return {
    id: serverCollection.id,
    name: serverCollection.name,
    description: serverCollection.description,
    cardsNumber: serverCollection.cardsNumber,
    tags: serverCollection.tags,
    createdBy: serverCollection.createdBy,
    createdAt: serverCollection.createdAt,
  };
}

export default function useCollectionRemoteService() {
  const { newCollection } = useCollectionModel();
  const { newBoxCollection } = useBoxCollectionModel();
  const { newCards } = useCardModel();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Retry wrapper for network requests
  async function fetchWithRetry(
    url: string,
    options?: RequestInit,
    retries: number = 3,
    backoff: number = 500
  ): Promise<Response> {
    try {
      return await fetch(url, options);
    } catch (err: unknown) {
      if (retries <= 1) throw err;
      console.log(`[CollectionRemoteService] Retry fetch: ${url}, retries left: ${retries - 1}`);
      await new Promise(res => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  }

  async function searchCollections(searchQuery: string): Promise<Collection[] | null> {
    try {
      console.log('searchCollections');
      const URL = `${apiBase}/collections/search?${new URLSearchParams({ query: searchQuery })}`;

      console.log('[CollectionRemoteService] Fetching collection:', URL);
      let res, data;
      try {
        res = await fetch(URL);
      } catch (err: unknown) {
        const fetchErr = err instanceof Error ? err : new Error(String(err));
        console.error('[CollectionRemoteService] Fetch failed:', fetchErr, 'URL:', URL);
        setError('Network error: ' + fetchErr.message);
        setLoading(false);
        throw fetchErr;
      }
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error(
          '[CollectionRemoteService] JSON parse failed:',
          jsonErr,
          'URL:',
          URL,
          'response:',
          res
        );
        setError('Invalid server response');
        setLoading(false);
        throw jsonErr;
      }
      if (!data || !data.results) {
        throw Error('Network Error');
      }
      return data.results as Collection[];
    } catch (e) {
      console.log('Error in searchCollections');
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function fetchLibrary(): Promise<{
    collections: ServerCollection[];
    groups: ServerGroup[];
    collectionGroups: ServerCollectionGroup[];
  } | null> {
    try {
      setLoading(true);
      console.log('fetchLibrary');
      const URL = `${apiBase}/collections/library`;

      console.log('[CollectionRemoteService] Fetching library:', URL);
      let res, data;
      try {
        res = await fetch(URL);
      } catch (err: unknown) {
        const fetchErr = err instanceof Error ? err : new Error(String(err));
        console.error('[CollectionRemoteService] Fetch failed:', fetchErr, 'URL:', URL);
        setError('Network error: ' + fetchErr.message);
        setLoading(false);
        throw fetchErr;
      }
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error(
          '[CollectionRemoteService] JSON parse failed:',
          jsonErr,
          'URL:',
          URL,
          'response:',
          res
        );
        setError('Invalid server response');
        setLoading(false);
        throw jsonErr;
      }
      if (!data || !data.collections || !data.groups || !data.collection_groups) {
        throw Error('Network Error');
      }

      return {
        collections: data.collections as ServerCollection[],
        groups: data.groups as ServerGroup[],
        collectionGroups: data.collection_groups as ServerCollectionGroup[],
      };
    } catch (e) {
      console.log('Error in fetchLibrary');
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred');
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
      console.log('getCollectionPreview');
      const URL = `${apiBase}/collections/preview/${collectionId}`;

      console.log('[CollectionRemoteService] Fetching collection:', URL);
      let res, data;
      try {
        res = await fetch(URL);
      } catch (err: unknown) {
        const fetchErr = err instanceof Error ? err : new Error(String(err));
        console.error('[CollectionRemoteService] Fetch failed:', fetchErr, 'URL:', URL);
        setError('Network error: ' + fetchErr.message);
        setLoading(false);
        throw fetchErr;
      }
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error(
          '[CollectionRemoteService] JSON parse failed:',
          jsonErr,
          'URL:',
          URL,
          'response:',
          res
        );
        setError('Invalid server response');
        setLoading(false);
        throw jsonErr;
      }
      if (data && data.collection && data.cards) {
        return {
          collection: data.collection as Collection,
          cards: data.cards as Card[],
        };
      }
      return null;
    } catch (e) {
      console.log('Error in getCollectionPreview');
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function addCollection(
    boxId: number,
    collectionId: number,
    shuffle: boolean = false
  ): Promise<void> {
    console.log('[CollectionRemoteService] Using API base URL:', apiBase);
    setLoading(true);
    setError(null);
    try {
      console.log('addCollection');
      const URL = `${apiBase}/collections/download/${collectionId}`;
      console.log('[CollectionRemoteService] Fetching download URL:', URL);

      let res, data;
      try {
        // Use retry logic to handle intermittent failures
        res = await fetchWithRetry(URL);
      } catch (err: unknown) {
        const fetchErr = err instanceof Error ? err : new Error(String(err));
        console.error('[CollectionRemoteService] Fetch failed:', fetchErr, 'URL:', URL);
        setError('Network error: ' + fetchErr.message);
        setLoading(false);
        throw fetchErr;
      }
      // Log response details for debugging large or malformed payloads
      console.log('[CollectionRemoteService] Response status:', res.status, 'ok:', res.ok);
      console.log(
        '[CollectionRemoteService] Response headers:',
        JSON.stringify(Array.from(res.headers.entries()))
      );
      let text: string;
      try {
        text = await res.text();
      } catch (textErr: unknown) {
        console.error('[CollectionRemoteService] Failed to read response text:', textErr);
        setError('Failed reading server response');
        setLoading(false);
        throw textErr;
      }
      console.log('[CollectionRemoteService] Response text length:', text.length);
      try {
        data = JSON.parse(text);
      } catch (jsonErr: unknown) {
        console.error(
          '[CollectionRemoteService] JSON parse failed:',
          jsonErr,
          'URL:',
          URL,
          'response text length:',
          text.length
        );
        setError('Invalid server response');
        setLoading(false);
        throw jsonErr;
      }
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
        var cards = data.cards.map((card: any) => ({
          collectionId: newColId,
          front: card.front,
          back: card.back,
          frontImg: card.frontimg ? -card.frontimg : null, // Important: update global id to "-", positive values would be local ids
          backImg: card.backimg ? -card.backimg : null, // Important: update global id to "-", positive values would be local ids
          frontSound: card.frontsound ? -card.frontsound : null, // Important: update global id to "-", positive values would be local ids
          backSound: card.backsound ? -card.backsound : null, // Important: update global id to "-", positive values would be local ids
          initialEaseFactor: card.initialeasefactor,
        }));
        if (shuffle) {
          // Shuffle cards using Fisher-Yates algorithm
          for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
          }
        }
        await newCards(cards);
        //TODO: sync media if needed too
      }
    } catch (e) {
      console.log('Error in addCollection');
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred');
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
    fetchLibrary,
  };
}
