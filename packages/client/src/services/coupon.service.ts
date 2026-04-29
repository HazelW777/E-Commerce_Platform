import apiClient from "../lib/apiClient";
import type { ValidateCouponInput } from "@project1/shared";

export interface CouponData {
  _id: string;
  code: string;
  couponType: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  expirationDate: string;
  isActive: boolean;
}

export interface CouponValidateResult {
  coupon: CouponData;
  discountAmount: number;
}

export const couponApi = {
  validateCoupon: async (input: ValidateCouponInput): Promise<CouponValidateResult> => {
    const res = await apiClient.post<{ success: boolean; data: CouponValidateResult }>(
      "/api/coupon/validate",
      input,
    );
    return res.data.data;
  },
};
