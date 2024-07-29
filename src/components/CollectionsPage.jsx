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
import { Link } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';


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

const CollectionsPage  = ({ collections, setCollections }) => {
 

  // State to manage the dialog visibility
  const [openDialog, setOpenDialog] = useState(false);

  // State to manage the current collection data in the dialog
  const [currentCollection, setCurrentCollection] = useState({ id: null, name: '', cards: [] });

  // State to manage whether the dialog is for adding or editing a collection
  const [isEditing, setIsEditing] = useState(false);

  // Function to handle opening the dialog
  const handleDialogOpen = (collection = { id: null, name: '', cards: [] }) => {
    setIsEditing(!!collection.id);
    setCurrentCollection(collection);
    setOpenDialog(true);
  };

  // Function to handle closing the dialog
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Function to handle adding or editing a collection
  const handleSaveCollection = () => {
    if (isEditing) {
      // Edit existing collection
      setCollections((prevCollections) =>
        prevCollections.map((col) =>
          col.id === currentCollection.id ? currentCollection : col
        )
      );
    } else {
      // Add new collection
      setCollections((prevCollections) => [
        ...prevCollections,
        { ...currentCollection, id: Date.now(), cards: [] },
      ]);
    }
    setOpenDialog(false);
  };

  // Function to handle deleting a collection
  const handleDeleteCollection = (id) => {
    setCollections((prevCollections) =>
      prevCollections.filter((collection) => collection.id !== id)
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleDialogOpen()}
        style={{ marginBottom: '20px' }}
      >
        New Collection
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledHeaderCell>Collection Name</StyledHeaderCell>
              <StyledHeaderCell>Number of Cards</StyledHeaderCell>
              <StyledHeaderCell>Actions</StyledHeaderCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {collections.map((collection) => (
              <StyledTableRow key={collection.id}>
                <TableCell>
                    <Link to={`/collection/${collection.id}`}>{collection.name}</Link>
                </TableCell>
                <TableCell>{collection.cards.length}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDialogOpen(collection)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteCollection(collection.id)} color="secondary">
                    <Delete />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isEditing ? 'Edit Collection' : 'New Collection'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            value={currentCollection.name}
            onChange={(e) =>
              setCurrentCollection({ ...currentCollection, name: e.target.value })
            }
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleSaveCollection} color="primary" disabled={!currentCollection.name}>
            OK
          </Button>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CollectionsPage;
