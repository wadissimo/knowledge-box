import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useCollections } from "../../context/CollectionContext";
import CollectionsTable from "./CollectionsTable";
import CollectionEditDialog from "./CollectionEditDialog";

const CollectionsPage = () => {
  const { collections, addCollection, updateCollection, deleteCollection } =
    useCollections();
  // State to manage the dialog visibility
  const [openDialog, setOpenDialog] = useState(false);

  // State to manage the current collection data in the dialog
  const [currentCollection, setCurrentCollection] = useState({
    id: null,
    name: "",
    cards: [],
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleDialogOpen = (collection = { id: null, name: "", cards: [] }) => {
    setIsEditing(!!collection.id);
    setCurrentCollection(collection);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSaveCollection = (name) => {
    if (isEditing) {
      // Update
      updateCollection({
        ...currentCollection,
        name,
      });
    } else {
      // Add new collection
      addCollection({ id: Date.now(), name, cards: [] });
    }
    setOpenDialog(false);
  };

  // Function to handle deleting a collection
  const handleDeleteCollection = (id) => {
    deleteCollection(id);
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
        New Collection
      </Button>

      <CollectionsTable
        collections={collections}
        onEditDialog={handleDialogOpen}
        onDeleteCollection={handleDeleteCollection}
      />

      <CollectionEditDialog
        openDialog={openDialog}
        collection={currentCollection}
        isEditing={isEditing}
        onDialogClose={handleDialogClose}
        onDialogSave={handleSaveCollection}
      />
    </div>
  );
};

export default CollectionsPage;
