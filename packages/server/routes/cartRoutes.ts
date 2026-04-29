import express from "express";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
} from "@project1/shared";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
} from "../controllers/cartController";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/items", validate(addToCartSchema), addToCart);
router.put(
  "/items/:productId",
  validate(cartItemParamsSchema, "params"),
  validate(updateCartItemSchema),
  updateCartItem,
);
router.delete(
  "/items/:productId",
  validate(cartItemParamsSchema, "params"),
  removeFromCart,
);
router.delete("/items", clearCart);
router.post("/checkout", checkout);

export default router;
