import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  verifyEmail,
  resendVerificationEmail,
  resetPassword,
  getMe,
  logout,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@project1/shared";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/resend-verification-email", validate(forgotPasswordSchema), resendVerificationEmail);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
