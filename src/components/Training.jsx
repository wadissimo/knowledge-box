// src/components/TrainingDetail.js

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


import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { Link, useParams } from 'react-router-dom';


const Training  = ({ collections }) => {
  const [currentCard, setCurrentCard] = useState();
  const { collectionId } = useParams();
  const currentCollection = collections.find((collection) => collection.id === parseInt(collectionId));
  
  
  
  console.log("currentCollection", currentCollection);
  const curCard = currentCollection.cards[0] 
  //setCurrentCard(currentCollection.cards[0]);
  console.log("curCard", curCard);
  return (
    <div style={{ padding: '20px' }}>
      <div>{currentCollection.name}</div>
      <div>{curCard.frontText}</div>
      
    </div>
  );
};



export default Training;
