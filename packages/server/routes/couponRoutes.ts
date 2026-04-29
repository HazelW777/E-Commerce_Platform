import express from "express";
import { validate } from "../middleware/validate";
import { validateCouponSchema } from "@project1/shared";
import { validateCoupon } from "../controllers/couponController";

const router = express.Router();

router.post("/validate", validate(validateCouponSchema), validateCoupon);

export default router;
