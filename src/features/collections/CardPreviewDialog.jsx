import React, { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import Card from "../card/Card";

export default function CardPreviewDialog({
  openPreview,
  previewCard,
  onPreviewClose,
}) {
  const [showFront, setShowFront] = useState(true);

  useEffect(
    function () {
      setShowFront(true);
    },
    [previewCard]
  );
  return (
    <Dialog open={openPreview} onClose={onPreviewClose}>
      <DialogTitle>Card Preview</DialogTitle>
      <DialogContent>
        <Card card={previewCard} />
        {/* <Typography
          variant="h6"
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => setShowFront(!showFront)}
        >
          {showFront ? previewCard?.front : previewCard?.back}
        </Typography> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onPreviewClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
