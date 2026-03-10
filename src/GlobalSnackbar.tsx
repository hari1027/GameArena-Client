import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface SnackbarHandle {
  showNotification: (message: string, severity?: AlertColor) => void;
}

const GlobalSnackbar = forwardRef<SnackbarHandle>((_props, ref) => {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  useImperativeHandle(ref, () => ({
    showNotification: (message: string, severity: AlertColor = "success") => {
      setState({
        open: true,
        message,
        severity,
      });
    },
  }));

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={state.severity}
        variant="filled"
        sx={{ width: "100%", borderRadius: "12px", fontWeight: 500 }}
        elevation={6}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
});

export default GlobalSnackbar;
