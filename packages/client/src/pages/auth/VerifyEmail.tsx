import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { authApi } from "../../services/auth.service";
import { loginSuccess } from "../../store/authSlice";
import { useAppDispatch } from "../../store";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [status, setStatus] = React.useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = React.useState("");
  const [resendEmail, setResendEmail] = React.useState("");
  const [resendStatus, setResendStatus] = React.useState<"idle" | "loading" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = React.useState("");

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendStatus("loading");
    try {
      const msg = await authApi.resendVerificationEmail(resendEmail);
      setResendMessage(msg);
      setResendStatus("sent");
    } catch (err: any) {
      setResendMessage(err?.response?.data?.message ?? "Failed to resend email.");
      setResendStatus("error");
    }
  };

  React.useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    authApi
      .verifyEmail({ token })
      .then(({ message, user }) => {
        dispatch(loginSuccess({ ...user, isVerified: true }));
        setMessage(message);
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.message ?? "Invalid or expired verification link.");
      });
  }, []);

  return (
    <Stack direction="column" sx={{ justifyContent: "center", flex: 1, p: 2 }}>
      <Card variant="outlined">
        {status === "pending" && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CircularProgress />
            <Typography>Verifying your email...</Typography>
          </Box>
        )}
        {status === "success" && (
          <>
            <Alert severity="success">{message}</Alert>
            <Button variant="contained" onClick={() => navigate("/")}>
              Continue to Sign in
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <Alert severity="error">{message}</Alert>
            <Typography variant="body2" color="text.secondary">
              Enter your email to resend the verification link:
            </Typography>
            <TextField
              size="small"
              type="email"
              placeholder="your@email.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              disabled={resendStatus === "sent"}
            />
            {resendStatus === "sent" && (
              <Alert severity="success">{resendMessage}</Alert>
            )}
            {resendStatus === "error" && (
              <Alert severity="error">{resendMessage}</Alert>
            )}
            <Button
              variant="contained"
              onClick={handleResend}
              disabled={!resendEmail || resendStatus === "loading" || resendStatus === "sent"}
            >
              {resendStatus === "loading" ? "Sending..." : "Resend verification email"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Back to Sign in
            </Button>
          </>
        )}
      </Card>
    </Stack>
  );
}
