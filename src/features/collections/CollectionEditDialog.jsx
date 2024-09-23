import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export default function CollectionEditDialog({
  openDialog,
  collection,
  isEditing,
  onDialogClose,
  onDialogSave,
}) {
  const [name, setName] = useState("");
  useEffect(
    function () {
      setName(collection.name);
    },
    [collection]
  );
  return (
    <Dialog open={openDialog} onClose={onDialogClose}>
      <DialogTitle>
        {isEditing ? "Edit Collection" : "New Collection"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Collection Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => onDialogSave(name)}
          color="primary"
          disabled={!name}
        >
          OK
        </Button>
        <Button onClick={onDialogClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
