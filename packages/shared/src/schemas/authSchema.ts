import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase() // Trim whitespace and convert to lowercase for consistency
  .pipe(z.email({ message: "Invalid email format" }));

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password is too long" })
  .regex(/[A-Z]/, { message: "Must contain uppercase letter" })
  .regex(/[a-z]/, { message: "Must contain lowercase letter" })
  .regex(/\d/, { message: "Must contain a number" })
  .regex(/[@$!%*?&]/, { message: "Must contain special character" });

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["customer", "seller"]).default("customer"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

// Change password after login
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: "Old password is required" }),
    newPassword: passwordSchema,
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
});
