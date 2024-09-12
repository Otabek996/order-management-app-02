import * as React from "react";
import { useState, forwardRef, useImperativeHandle } from "react";
import Alert from "@mui/material/Alert";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

const SnackbarAlert = forwardRef(
  (
    {
      text,
      type,
    }: {
      text: string;
      type: "success" | "error" | "info" | "warning";
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);

    const handleOpenSnackbar = () => {
      setOpen(true);
    };

    const handleCloseSnackbar = (
      event: React.SyntheticEvent | Event,
      reason?: SnackbarCloseReason
    ) => {
      if (reason === "clickaway") {
        return;
      }
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      openSnackbar() {
        handleOpenSnackbar();
      },
    }));

    const action = (
      <React.Fragment>
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleCloseSnackbar}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    );

    return (
      <>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          action={action}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={type}
            sx={{ width: "100%" }}
          >
            {text}
          </Alert>
        </Snackbar>
      </>
    );
  }
);

export default SnackbarAlert;
