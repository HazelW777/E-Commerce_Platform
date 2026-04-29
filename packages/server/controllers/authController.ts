import crypto from "crypto";
import { Request, Response } from "express";
import ms, { StringValue } from "ms";
import User from "../models/User";
import AppError from "../utils/AppError";
import { signToken } from "../utils/jwt";
import { sendEmail } from "../utils/sendEmail";
import { env } from "../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  // secrure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // CSRF protection
  maxAge: ms(env.JWT_EXPIRES_IN as StringValue),
};

const setTokenCookie = (res: Response, token: string): void => {
  res.cookie("token", token, COOKIE_OPTIONS);
};

//----------------- Register -----------------
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("Email has been registered!", 409);

  const newUser = await User.create({ email, password, role });
  const rawToken = newUser.generateRegisterVerificationToken();
  await newUser.save();

  try {
    await sendEmail({
      to: newUser.email,
      subject: "Verify your account",
      text: `Click the link to verify your account: ${env.CLIENT_URL}/verify-email?token=${rawToken}`,
    });
  } catch {
    // Email failure does not block registration; user can resend via /resend-verification-email
  }

  res.json({ message: "Registration successful. Please check your email to verify your account." });
};

// ----------------- Login -----------------
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw new AppError("EMAIL_NOT_VERIFIED", 403);
  }

  const token = signToken(user.id, user.role);
  setTokenCookie(res, token);
  res.json({
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
};

// ----------------- Change password after login -----------------
export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id).select("+password");
  if (!user || !(await user.comparePassword(oldPassword))) {
    throw new AppError("Old password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password changed successfully" });
};

// ----------------- Password reset -----------------
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("No account found with that email", 404);

  const rawToken = user.generateResetToken();
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${env.CLIENT_URL}/reset-password?token=${rawToken}\n\nThis link will expire in 10 minutes.`,
    });
    res.json({ message: "Password reset email has been sent" });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw new AppError("Failed to send email. Please try again later.", 500);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) throw new AppError("Invalid or expired token", 400);

  if (await user.comparePassword(newPassword)) {
    throw new AppError("New password must be different from your current password", 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: "Password reset successfully" });
};

// ----------------- Email verification -----------------
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token: verificationToken } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  const user = await User.findOne({
    registerVerificationToken: hashedToken,
    registerVerificationExpires: { $gt: Date.now() },
  }).select("+registerVerificationToken +registerVerificationExpires");

  if (!user) throw new AppError("Invalid or expired token", 400);

  user.isVerified = true;
  user.registerVerificationToken = undefined;
  user.registerVerificationExpires = undefined;
  await user.save();

  const token = signToken(user.id, user.role);
  setTokenCookie(res, token);
  res.json({
    message: "Email verified successfully",
    user: { id: user._id, email: user.email, role: user.role },
  });
};

// Resend verification email if user hasn’t received it or the token has expired
export const resendVerificationEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new AppError("No account found with that email", 404);
  if (user.isVerified) throw new AppError("Email is already verified", 400);

  const rawToken = user.generateRegisterVerificationToken();
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Verify your account",
    text: `Click the link to verify your account: ${env.CLIENT_URL}/verify-email?token=${rawToken}`,
  });
  res.json({ message: "Verification email resent." });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json({ user: req.user });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
};
