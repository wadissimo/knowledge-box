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
import { Edit, Delete, Preview } from "@mui/icons-material";

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
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function CardsTable({
  cards,
  onPreviewCard,
  onEditCard,
  onDeleteCard,
}) {
  return (
    cards && (
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
                <TableCell>{card.front}</TableCell>
                <TableCell>{card.back}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => onPreviewCard(card.id)}
                    color="primary"
                  >
                    <Preview />
                  </IconButton>
                  <IconButton onClick={() => onEditCard(card)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => onDeleteCard(card.id)}
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
    )
  );
}
