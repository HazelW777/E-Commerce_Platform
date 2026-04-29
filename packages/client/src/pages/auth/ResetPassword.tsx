import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { styled } from "@mui/material/styles";
import { resetPasswordSchema } from "@project1/shared";
import { authApi } from "../../services/auth.service";

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = React.useState("");

  if (!token) {
    return (
      <Stack
        direction="column"
        sx={{ justifyContent: "center", flex: 1, p: 2 }}
      >
        <Card variant="outlined">
          <Alert severity="error">
            Invalid reset link. Please request a new one.
          </Alert>
          <Button variant="outlined" onClick={() => navigate("/")}>
            Back to Sign in
          </Button>
        </Card>
      </Stack>
    );
  }

  const validate = () => {
    const result = resetPasswordSchema.safeParse({
      token,
      newPassword: password,
    });
    if (!result.success) {
      const msg =
        result.error.issues.find((i) => i.path[0] === "newPassword")?.message ??
        "";
      setPasswordError(msg);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setServerError("");
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setStatus("success");
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ?? "Failed to reset password.",
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <Stack
        direction="column"
        sx={{ justifyContent: "center", flex: 1, p: 2 }}
      >
        <Card variant="outlined">
          <Alert severity="success">Password reset successfully.</Alert>
          <Button variant="contained" onClick={() => navigate("/")}>
            Back to Sign in
          </Button>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack direction="column" sx={{ justifyContent: "center", flex: 1, p: 2 }}>
      <Card variant="outlined">
        <Typography component="h1" variant="h5">
          Set new password
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="new-password">New password</FormLabel>
            <TextField
              required
              fullWidth
              id="new-password"
              name="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              disabled={status === "loading"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
          {serverError && (
            <Alert severity="error" onClose={() => setServerError("")}>
              {serverError}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Resetting..." : "Reset password"}
          </Button>
          <Button variant="text" onClick={() => navigate("/")}>
            Back to Sign in
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}
