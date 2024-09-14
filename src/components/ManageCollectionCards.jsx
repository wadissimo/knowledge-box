import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete, Preview } from "@mui/icons-material";
import { Link, useParams } from "react-router-dom";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const ManageCollectionCards = ({ collections, setCollections }) => {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCardId, setCurrentCardId] = useState();
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");

  const [openPreview, setOpenPreview] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [showFront, setShowFront] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/collections/${id}/cards`)
      .then((response) => response.json())
      .then((data) => setCards(data));
  }, [id]);

  const handleDialogOpen = (
    card = { id: null, frontText: "", backText: "" }
  ) => {
    setIsEditing(!!card.id);
    setCurrentCardId(card.id);
    setFrontText(card.frontText);
    setBackText(card.backText);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handlePreview = (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    setPreviewCard(card);
    setShowFront(true);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
  };
  const addCard = (frontText, backText) => {
    fetch(`${API_BASE_URL}/collections/${id}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ frontText, backText }),
    })
      .then((response) => response.json())
      .then((newCard) => setCards([...cards, newCard]));
  };

  const updateCard = (cardId, frontText, backText) => {
    fetch(`${API_BASE_URL}/collections/${id}/cards/${cardId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ frontText, backText }),
    })
      .then((response) => response.json())
      .then((updatedCard) => {
        const updatedCards = cards.map((card) =>
          card.id === cardId ? updatedCard : card
        );
        setCards(updatedCards);
      });
  };

  const deleteCard = (cardId) => {
    fetch(`${API_BASE_URL}/collections/${id}/cards/${cardId}`, {
      method: "DELETE",
    }).then(() => {
      const updatedCards = cards.filter((card) => card.id !== cardId);
      setCards(updatedCards);
    });
  };

  const handleSaveCard = () => {
    if (isEditing) {
      updateCard(currentCardId, frontText, backText);
    } else {
      addCard(frontText, backText);
    }

    setFrontText("");
    setBackText("");
  };

  const handleSaveCloseCard = () => {
    handleSaveCard();
    setOpenDialog(false);
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

      {cards.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledHeaderCell>Front</StyledHeaderCell>
                <StyledHeaderCell>Back</StyledHeaderCell>
                <StyledHeaderCell>Actions</StyledHeaderCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {cards.map((card) => (
                <StyledTableRow key={card.id}>
                  <TableCell>{card.frontText}</TableCell>
                  <TableCell>{card.backText}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handlePreview(card.id)}
                      color="primary"
                    >
                      <Preview />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDialogOpen(card)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteCard(card.id)}
                      color="secondary"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleDialogClose}>
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
            onClick={handleSaveCloseCard}
            color="primary"
            disabled={!backText || !frontText}
          >
            Save & Close
          </Button>
          <Button onClick={handleDialogClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPreview} onClose={handlePreviewClose}>
        <DialogTitle>Card Preview</DialogTitle>
        <DialogContent>
          <Typography
            variant="h6"
            style={{ textAlign: "center", cursor: "pointer" }}
            onClick={() => setShowFront(!showFront)}
          >
            {showFront ? previewCard?.frontText : previewCard?.backText}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageCollectionCards;
