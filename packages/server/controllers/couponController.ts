import { Request, Response } from "express";
import Coupon from "../models/Coupon";
import AppError from "../utils/AppError";

export const validateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { code, subtotal } = req.body;

  const coupon = await Coupon.findOne({ code });

  if (!coupon || !coupon.isValid()) {
    throw new AppError("Invalid or expired coupon code", 400);
  }

  if (!coupon.isUsable(subtotal)) {
    throw new AppError("Does not meet minimum order amount", 400);
  }

  const discountAmount = coupon.calculateDiscount(subtotal);
  res.json({ success: true, data: { coupon, discountAmount } });
};
