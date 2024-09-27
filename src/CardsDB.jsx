// App.js
import React, { useEffect, useState } from "react";
import { addCard, getAllCards, updateCard } from "./db";

function CardsDB() {
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch all cards when the component mounts
  useEffect(() => {
    const fetchCards = async () => {
      const storedCards = await getAllCards();
      setCards(storedCards);
    };

    fetchCards();
  }, []);

  // Handle adding a new card
  const handleAddCard = async () => {
    const newCard = {
      front,
      back,
      date: new Date().toISOString(),
    };
    await addCard(newCard);
    setFront("");
    setBack("");
    setCards(await getAllCards());
  };

  // Handle editing a card
  const handleUpdateCard = async () => {
    if (editId) {
      const updatedCard = {
        front,
        back,
        date: new Date().toISOString(),
      };
      await updateCard(editId, updatedCard);
      setEditId(null);
      setFront("");
      setBack("");
      setCards(await getAllCards());
    }
  };

  // Handle setting a card to be edited
  const handleEdit = (card) => {
    setFront(card.front);
    setBack(card.back);
    setEditId(card.id);
  };

  return (
    <div>
      <h1>Flashcards</h1>

      <div>
        <input
          type="text"
          placeholder="Front side"
          value={front}
          onChange={(e) => setFront(e.target.value)}
        />
        <input
          type="text"
          placeholder="Back side"
          value={back}
          onChange={(e) => setBack(e.target.value)}
        />

        <button onClick={editId ? handleUpdateCard : handleAddCard}>
          {editId ? "Update Card" : "Add Card"}
        </button>
      </div>

      <h2>All Cards</h2>
      <ul>
        {cards.map((card) => (
          <li key={card.id}>
            <p>Front: {card.front}</p>
            <p>Back: {card.back}</p>
            <p>Date: {new Date(card.date).toLocaleString()}</p>
            <button onClick={() => handleEdit(card)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CardsDB;
