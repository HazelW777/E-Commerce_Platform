import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { useAppDispatch, useAppSelector } from "../store";
import { clearGlobalError } from "../store/uiSlice";

export function GlobalErrorScreen() {
  const dispatch = useAppDispatch();
  const globalError = useAppSelector((s) => s.ui.globalError);

  if (!globalError) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "background.default",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" gutterBottom sx={{ mb: 5 }}>
        Oops! Something went wrong.
      </Typography>
      <Button
        variant="contained"
        onClick={() => {
          dispatch(clearGlobalError());
          window.location.reload();
        }}
      >
        Try Again
      </Button>
    </Box>
  );
}
