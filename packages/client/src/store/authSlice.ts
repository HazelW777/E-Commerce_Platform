import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type { User, LoginInput, RegisterInput } from "@project1/shared";
import { authApi } from "../services/auth.service";

export type { User };

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const error = err as AxiosError<{ message: string }>;
  return error.response?.data?.message ?? fallback;
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getMe();
    } catch {
      return rejectWithValue(null);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginInput, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      if (error.response?.status === 403) {
        return rejectWithValue("EMAIL_NOT_VERIFIED");
      }
      return rejectWithValue(getErrorMessage(err, "Login failed"));
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterInput, { rejectWithValue }) => {
    try {
      return await authApi.register(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Registration failed"));
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) Object.assign(state.user, action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { loginSuccess, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
