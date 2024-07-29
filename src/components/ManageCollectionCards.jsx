import React, { useState } from 'react';
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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import Card from '../data/Card';
import { v4 as uuidv4 } from 'uuid';

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
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

const ManageCollectionCards  = ({collections, setCollections}) => {

    const { id } = useParams();

    const [openDialog, setOpenDialog] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [currentCardId, setCurrentCardId] = useState();

    const [frontText, setFrontText] = useState("");
    
    const [backText, setBackText] = useState("");

    // selected collection
    const collection = collections.find(
        (collection) => collection.id === parseInt(id)
      );

    
    // Function to handle opening the dialog
    const handleDialogOpen = (card = new Card(null, "", "")) => {
        setIsEditing(!!card.id);
        setCurrentCardId(card.id)
        //setCurrentCollection(collection);
        setFrontText(card.frontText)
        setBackText(card.backText)
        setOpenDialog(true);
    };

    // Function to handle closing the dialog
    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const addCard = (collectionId, frontText, backText) => {
        const updatedCollections = collections.map((collection) => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              cards: [...collection.cards, new Card(uuidv4(), frontText, backText)],
            };
          }
          return collection;
        });
        
        setCollections(updatedCollections);
    };

    const updateCard = (collectionId, cardId, frontText, backText) => {
      const updatedCollections = collections.map((collection) => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            cards: collection.cards.map((card) => {
              if (card.id == cardId) {
                  return {
                      ...card,
                      frontText: frontText,
                      backText: backText
                  }
              }
              return card;
            }),
          };
        }
        return collection;
      });
      
      setCollections(updatedCollections);
    };

    const deleteCard = (collectionId, cardId) => {
      const updatedCollections = collections.map((collection)=>{
          if (collection.id === collectionId) {
            return {
              ...collection,
              cards: collection.cards.filter((card) => card.id !== cardId)
            };
          }
          return collection;
        });
        console.log("updatedCollections", updatedCollections)
        setCollections(updatedCollections)
    };

    const handleSaveCard = () => {
        if (isEditing) {
            updateCard(collection.id, currentCardId, frontText, backText);
        } else {
            addCard(collection.id, frontText, backText);
        }
        
        setFrontText("")
        setBackText("")
    };
    
    const handleSaveCloseCard = () => {
        if (isEditing) {
            updateCard(collection.id, currentCardId, frontText, backText);
        } else {
            addCard(collection.id, frontText, backText);
        }
        setOpenDialog(false);
    };
    
    const handleDeleteCard = (cardId) => {
        deleteCard(collection.id, cardId);
    }

    return (
        <div style={{ padding: '20px' }}>
        <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleDialogOpen()}
            style={{ marginBottom: '20px' }}
        >
            New Card
        </Button>

        {collection.cards.length > 0 && (
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
                    {collection.cards.map((card) => (
                    <StyledTableRow key={card.id}>
                        
                        <TableCell>{card.frontText}</TableCell>
                        <TableCell>{card.backText}</TableCell>
                        
                        <TableCell>
                        <IconButton onClick={() => handleDialogOpen(card)} color="primary">
                            <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteCard(card.id)} color="secondary">
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
            <DialogTitle>{isEditing ? 'Edit Card' : 'New Card'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Front Text"
                    type="text"
                    fullWidth
                    value={frontText}
                    onChange={(e) =>
                        setFrontText(e.target.value)
                    }
                />
                <TextField
                    autoFocus
                    margin="dense"
                    label="Back Text"
                    type="text"
                    fullWidth
                    value={backText}
                    onChange={(e) =>
                        setBackText(e.target.value)
                    }
                />
            </DialogContent>
            <DialogActions>
                {!isEditing && (
                    <Button onClick={handleSaveCard} color="primary" disabled={!backText || !frontText}>
                        Save
                    </Button>
                )}
                <Button onClick={handleSaveCloseCard} color="primary" disabled={!backText || !frontText}>
                    Save & Close
                </Button>
                <Button onClick={handleDialogClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
    };

export default ManageCollectionCards;
