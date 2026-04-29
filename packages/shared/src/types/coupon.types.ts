import { z } from "zod";
import { validateCouponSchema } from "../schemas/couponSchema";

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
