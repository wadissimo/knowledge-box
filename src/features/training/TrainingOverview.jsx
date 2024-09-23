import React, { useState } from "react";
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
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import { useCollections } from "../../context/CollectionContext";

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
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const TrainingOverview = () => {
  const { collections } = useCollections();
  return (
    <div style={{ padding: "20px" }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledHeaderCell>Collection Name</StyledHeaderCell>
              <StyledHeaderCell>Number of Cards</StyledHeaderCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {collections.map((collection) => (
              <StyledTableRow key={collection.id}>
                <TableCell>
                  <Link to={`/training/${collection.id}`}>
                    {collection.name}
                  </Link>
                </TableCell>
                <TableCell>{collection.cards.length}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TrainingOverview;
