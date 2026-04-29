import { useAppDispatch, useAppSelector } from "../store";
import {
  loginSuccess,
  loginUser,
  registerUser,
  logoutUser,
  initializeAuth,
  updateUser,
  clearError,
} from "../store/authSlice";
import type { User, AuthState } from "../store/authSlice";
import type { LoginInput, RegisterInput } from "@project1/shared";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector(
    (s): AuthState => s.auth,
  );

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: (credentials: LoginInput) => dispatch(loginUser(credentials)),
    loginSuccess: (user: User) => dispatch(loginSuccess(user)),
    logout: () => dispatch(logoutUser()),
    register: (data: RegisterInput) => dispatch(registerUser(data)),
    initialize: () => dispatch(initializeAuth()),
    updateUser: (data: Partial<User>) => dispatch(updateUser(data)),
    clearError: () => dispatch(clearError()),
  };
};
