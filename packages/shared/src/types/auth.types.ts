import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../schemas/authSchema";

export interface User {
  id: string;
  email: string;
  role: "customer" | "seller" | "admin";
  isVerified: boolean;
}

export interface AuthUserResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.input<typeof verifyEmailSchema>;
