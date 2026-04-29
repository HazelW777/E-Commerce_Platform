import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { authApi } from "../../services/auth.service";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const handleExited = () => {
    setStatus("idle");
    setMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = (event.currentTarget.elements.namedItem("forgot-email") as HTMLInputElement).value;
    setStatus("loading");
    try {
      const msg = await authApi.forgotPassword({ email });
      setMessage(msg);
      setStatus("sent");
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? "Failed to send reset email.");
      setStatus("error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={status === "loading" ? undefined : handleClose}
      slotProps={{ paper: { sx: { backgroundImage: "none" } }, transition: { onExited: handleExited } }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          {status === "sent" ? (
            <Alert severity="success">{message}</Alert>
          ) : (
            <>
              <DialogContentText>
                Enter your account&apos;s email address, and we&apos;ll send you a link to reset your password.
              </DialogContentText>
              <OutlinedInput
                autoFocus
                required
                margin="dense"
                id="forgot-email"
                name="forgot-email"
                placeholder="Email address"
                type="email"
                fullWidth
                disabled={status === "loading"}
              />
              {status === "error" && <Alert severity="error">{message}</Alert>}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={handleClose} disabled={status === "loading"}>
            {status === "sent" ? "Close" : "Cancel"}
          </Button>
          {status !== "sent" && (
            <Button variant="contained" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Continue"}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
