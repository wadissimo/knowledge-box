import React, { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

// Component
export default function CardEditDialog({
  openDialog,
  card,
  isEditing,
  onDialogClose,
  onDialogSave,
}) {
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const cardId = card ? card.id : null;

  useEffect(
    function () {
      setFrontText(card?.front || "");
      setBackText(card?.back || "");
    },
    [card]
  );

  return (
    <Dialog open={openDialog} onClose={onDialogClose}>
      <DialogTitle>{isEditing ? "Edit Card" : "New Card"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Front Text"
          type="text"
          fullWidth
          value={frontText}
          onChange={(e) => setFrontText(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Back Text"
          type="text"
          fullWidth
          value={backText}
          onChange={(e) => setBackText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onDialogSave(cardId, frontText, backText)}
          color="primary"
          disabled={!backText || !frontText}
        >
          Save & Close
        </Button>
        <Button onClick={onDialogClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
