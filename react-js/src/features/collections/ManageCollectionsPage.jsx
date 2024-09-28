import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useLoaderData, useParams } from "react-router-dom";

import CardsTable from "./CardsTable";
import CardEditDialog from "./CardEditDialog";
import { useCollections } from "../../context/CollectionContext";
import { v4 as uuidv4 } from "uuid";
import CardPreviewDialog from "./CardPreviewDialog";

const API_BASE_URL = "http://localhost:8010/collections";

const ManageCollectionsPage = () => {
  const { updateCollection } = useCollections();
  const collection = useLoaderData();

  // const [cards, setCards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCard, setCurrentCard] = useState({});

  const [openPreview, setOpenPreview] = useState(false);

  // derive cards from the current collection
  const [cards, setCards] = useState(collection ? collection.cards : []);

  // sync collection when cards updated
  useEffect(
    function () {
      updateCollection({
        ...collection,
        cards,
      });
    },
    [cards]
  );

  // Edit Dialog
  const handleDialogOpen = (card = { id: null, front: "", back: "" }) => {
    setIsEditing(!!card.id);
    setCurrentCard(card);
    setOpenDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSaveCard = (id, front, back) => {
    if (isEditing) {
      updateCard(id, front, back);
    } else {
      addCard(front, back);
    }
    setOpenDialog(false);
  };

  // New
  const addCard = (front, back) => {
    setCards((cards) => [...cards, { id: uuidv4(), front, back }]);
  };
  // Update
  const updateCard = (cardId, front, back) => {
    setCards((cards) =>
      cards.map((card) =>
        card.id !== cardId
          ? card
          : {
              ...card,
              front,
              back,
            }
      )
    );
  };
  // Delete
  const deleteCard = (cardId) => {
    setCards((cards) => cards.filter((card) => card.id !== cardId));
  };

  // Preview Dialog
  const handlePreview = (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    setCurrentCard(card);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
  };

  // Delete Button
  const handleDeleteCard = (id) => {
    deleteCard(id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleDialogOpen()}
        style={{ marginBottom: "20px" }}
      >
        New Card
      </Button>

      <CardsTable
        cards={cards}
        onPreviewCard={handlePreview}
        onEditCard={handleDialogOpen}
        onDeleteCard={handleDeleteCard}
      />

      <CardEditDialog
        openDialog={openDialog}
        card={currentCard}
        isEditing={isEditing}
        onDialogClose={handleEditDialogClose}
        onDialogSave={handleSaveCard}
      />

      <CardPreviewDialog
        openPreview={openPreview}
        previewCard={currentCard}
        onPreviewClose={handlePreviewClose}
      />
    </div>
  );
};

async function collectionLoader({ params }) {
  try {
    const res = await fetch(`${API_BASE_URL}/${params.id}`);
    const data = await res.json();
    return data;
  } catch (error) {
    throw Error("failed fetching: " + error.message);
  }
}

export default ManageCollectionsPage;
export { collectionLoader };
