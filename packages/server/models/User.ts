import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "customer" | "seller" | "admin";
  isVerified: boolean;
  registerVerificationToken?: string;
  registerVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(password: string): Promise<boolean>;
  generateRegisterVerificationToken(): string;
  generateResetToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
    registerVerificationToken: { type: String, select: false },
    registerVerificationExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  //dont have to use next() because we are using async function, it will automatically wait for the hashing to complete before saving the user document
});

userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateRegisterVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(20).toString("hex");
  this.registerVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.registerVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return verificationToken;
};

userSchema.methods.generateResetToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
