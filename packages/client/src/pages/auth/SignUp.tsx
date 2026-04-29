import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { styled } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@project1/shared";
import { registerUser } from "../../store/authSlice";
import { useAppDispatch } from "../../store";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { width: "450px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp() {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { role: "customer" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      setSuccessMsg(
        result.payload ?? "Please check your email to verify your account.",
      );
    } else {
      setServerError((result.payload as string) ?? "Registration failed");
    }
  };

  if (successMsg) {
    return (
      <SignUpContainer
        direction="column"
        sx={{ justifyContent: "center", flex: 1 }}
      >
        <Card variant="outlined">
          <Alert severity="success">{successMsg}</Alert>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            <Link href="/signin" variant="body2">
              Back to Sign in
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
    );
  }

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignUpContainer
        direction="column"
        sx={{ justifyContent: "center", flex: 1 }}
      >
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
          >
            Create an account
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
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <TextField
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                autoComplete="new-password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
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

            <FormControl error={!!errors.role}>
              <FormLabel>Role</FormLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                  </Select>
                )}
              />
              {errors.role && (
                <FormHelperText>{errors.role.message}</FormHelperText>
              )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/signin" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </>
  );
}
