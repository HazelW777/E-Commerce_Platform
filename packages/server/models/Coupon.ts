import mongoose, { Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  couponType: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  expirationDate: Date;
  isActive: boolean;
  isValid(): boolean;
  isUsable(orderAmount: number): boolean;
  calculateDiscount(orderAmount: number): number;
}

const couponSchema = new mongoose.Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true },
    couponType: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

couponSchema.methods.isValid = function (): boolean {
  return this.isActive && new Date() < this.expirationDate;
};

couponSchema.methods.isUsable = function (orderAmount: number): boolean {
  return this.isValid() && orderAmount >= this.minOrderAmount;
};

couponSchema.methods.calculateDiscount = function (
  orderAmount: number,
): number {
  if (this.isValid() && orderAmount >= this.minOrderAmount) {
    if (this.couponType === "percentage")
      return (orderAmount * this.value) / 100;
    if (this.couponType === "fixed") return Math.min(this.value, orderAmount);
  }
  return 0;
};

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);

export default Coupon;
