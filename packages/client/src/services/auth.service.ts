import apiClient from "../lib/apiClient";
import type {
  User,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ChangePasswordInput,
} from "@project1/shared";

export const authApi = {
  login: async (data: LoginInput): Promise<User> => {
    const res = await apiClient.post<{ user: User }>("/api/auth/login", data);
    return res.data.user;
  },

  register: async (data: RegisterInput): Promise<string> => {
    const res = await apiClient.post<{ message: string }>("/api/auth/register", data);
    return res.data.message;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<{ user: User }>("/api/auth/me");
    return res.data.user;
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<string> => {
    const res = await apiClient.post<{ message: string }>("/api/auth/forgot-password", data);
    return res.data.message;
  },

  resetPassword: async (data: ResetPasswordInput): Promise<string> => {
    const res = await apiClient.post<{ message: string }>("/api/auth/reset-password", data);
    return res.data.message;
  },

  verifyEmail: async (data: VerifyEmailInput): Promise<{ message: string; user: User }> => {
    const res = await apiClient.post<{ message: string; user: User }>("/api/auth/verify-email", data);
    return res.data;
  },

  resendVerificationEmail: async (email: string): Promise<string> => {
    const res = await apiClient.post<{ message: string }>("/api/auth/resend-verification-email", { email });
    return res.data.message;
  },

  changePassword: async (data: ChangePasswordInput): Promise<string> => {
    const res = await apiClient.post<{ message: string }>("/api/auth/change-password", data);
    return res.data.message;
  },
};

export default apiClient;
