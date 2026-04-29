import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@project1/shared";
import { loginUser } from "../../store/authSlice";
import { useAppDispatch } from "../../store";
import { authApi } from "../../services/auth.service";
import ForgotPassword from "./ForgotPassword";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { maxWidth: "450px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(4) },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
  },
}));

export default function SignIn() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const [serverError, setServerError] = React.useState("");
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState("");
  const [resendStatus, setResendStatus] = React.useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [resendMessage, setResendMessage] = React.useState("");

  const handleResend = async () => {
    setResendStatus("loading");
    try {
      const msg = await authApi.resendVerificationEmail(unverifiedEmail);
      setResendMessage(msg);
      setResendStatus("sent");
    } catch (err: any) {
      setResendMessage(
        err?.response?.data?.message ?? "Failed to resend email.",
      );
      setResendStatus("error");
    }
  };

  const handleVerifyDialogClose = () => {
    setVerifyOpen(false);
    setResendStatus("idle");
    setResendMessage("");
  };

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      navigate(result.payload.role === "seller" ? "/my-products" : "/");
    } else if (result.payload === "EMAIL_NOT_VERIFIED") {
      setUnverifiedEmail(data.email);
      setVerifyOpen(true);
    } else {
      setServerError((result.payload as string) ?? "Login failed");
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignInContainer
        direction="column"
        sx={{ justifyContent: "center", flex: 1 }}
      >
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
          >
            Sign in to your account
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                {...register("email")}
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                fullWidth
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <TextField
                {...register("password")}
                type="password"
                placeholder="••••••"
                autoComplete="current-password"
                fullWidth
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </FormControl>
            {serverError && (
              <Alert severity="error" onClose={() => setServerError("")}>
                {serverError}
              </Alert>
            )}
            <ForgotPassword
              open={forgotOpen}
              handleClose={() => setForgotOpen(false)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0 },
              }}
            >
              <Typography variant="body2">
                Don&apos;t have an account?{" "}
                <Link href="/signup" variant="body2">
                  Sign up
                </Link>
              </Typography>
              <Link
                component="button"
                type="button"
                onClick={() => setForgotOpen(true)}
                variant="body2"
              >
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Card>
      </SignInContainer>

      <Dialog open={verifyOpen} onClose={handleVerifyDialogClose}>
        <DialogTitle>Email not verified</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <DialogContentText>
            Your account (<strong>{unverifiedEmail}</strong>) has not been
            verified yet. Please check your inbox or resend the verification
            email.
          </DialogContentText>
          {resendStatus === "sent" && (
            <Alert severity="success">{resendMessage}</Alert>
          )}
          {resendStatus === "error" && (
            <Alert severity="error">{resendMessage}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={handleVerifyDialogClose}>Close</Button>
          <Button
            variant="contained"
            onClick={handleResend}
            disabled={resendStatus === "loading" || resendStatus === "sent"}
          >
            {resendStatus === "loading"
              ? "Sending..."
              : "Resend verification email"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
