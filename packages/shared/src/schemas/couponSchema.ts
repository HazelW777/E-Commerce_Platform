import { z } from "zod";

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.coerce.number().min(0, "Subtotal must be non-negative"),
});
