import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

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

export default function CollectionsTable({
  collections,
  onEditDialog,
  onDeleteCollection,
}) {
  return (
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
                <Link to={`/cards/${collection.id}`}>{collection.name}</Link>
              </TableCell>
              <TableCell>{collection.cards.length}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onEditDialog(collection)}
                  color="primary"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => onDeleteCollection(collection.id)}
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
  );
}
