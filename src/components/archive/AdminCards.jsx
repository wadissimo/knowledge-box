// src/components/AdminCards.js

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';


const AdminCards = ({ collections, setCollections }) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [editCardId, setEditCardId] = useState(null);
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');
  const { id } = useParams();


  const selectedCollection = collections.find(
    (collection) => collection.id === id
  );

  const addCard = () => {
    if (newCardFront.trim() === '' || newCardBack.trim() === '') return;
    if (!selectedCollection) return;

    const newCard = {
      id: uuidv4(),
      front: newCardFront,
      back: newCardBack,
    };

    const updatedCollections = collections.map((collection) =>
      collection.id === selectedCollectionId
        ? { ...collection, cards: [...collection.cards, newCard] }
        : collection
    );

    setCollections(updatedCollections);
    setNewCardFront('');
    setNewCardBack('');
  };

  const deleteCard = (id) => {
    const updatedCollections = collections.map((collection) =>
      collection.id === selectedCollectionId
        ? { ...collection, cards: collection.cards.filter((card) => card.id !== id) }
        : collection
    );

    setCollections(updatedCollections);
  };

  const startEditing = (id, front, back) => {
    setEditCardId(id);
    setEditCardFront(front);
    setEditCardBack(back);
  };

  const saveEdit = () => {
    const updatedCollections = collections.map((collection) =>
      collection.id === selectedCollectionId
        ? {
            ...collection,
            cards: collection.cards.map((card) =>
              card.id === editCardId ? { ...card, front: editCardFront, back: editCardBack } : card
            ),
          }
        : collection
    );

    setCollections(updatedCollections);
    setEditCardId(null);
    setEditCardFront('');
    setEditCardBack('');
  };

  const moveCard = (index, direction) => {
    if (!selectedCollection) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedCollection.cards.length) return;

    const newCards = [...selectedCollection.cards];
    const [movedCard] = newCards.splice(index, 1);
    newCards.splice(newIndex, 0, movedCard);

    const updatedCollections = collections.map((collection) =>
      collection.id === selectedCollectionId ? { ...collection, cards: newCards } : collection
    );

    setCollections(updatedCollections);
  };

  return (
    <div>
      <h2>Manage Cards</h2>

      <div>
        <select
          value={selectedCollectionId || ''}
          onChange={(e) => setSelectedCollectionId(e.target.value)}
        >


          <option value="" disabled>
            Select a Collection
          </option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCollection && (
        <>
          <div>
            <input
              type="text"
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              placeholder="New Card Front"
            />
            <input
              type="text"
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
              placeholder="New Card Back"
            />
            <button onClick={addCard}>Add Card</button>
          </div>

          <ul>
            {selectedCollection.cards.map((card, index) => (
              <li key={card.id}>
                {editCardId === card.id ? (
                  <>
                    <input
                      type="text"
                      value={editCardFront}
                      onChange={(e) => setEditCardFront(e.target.value)}
                    />
                    <input
                      type="text"
                      value={editCardBack}
                      onChange={(e) => setEditCardBack(e.target.value)}
                    />
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={() => setEditCardId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div>{card.front}</div>
                    <div>{card.back}</div>
                    <button onClick={() => startEditing(card.id, card.front, card.back)}>Edit</button>
                    <button onClick={() => deleteCard(card.id)}>Delete</button>
                    <button onClick={() => moveCard(index, -1)}>Up</button>
                    <button onClick={() => moveCard(index, 1)}>Down</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminCards;
