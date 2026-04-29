import { z } from "zod";
import { addToCartSchema, updateCartItemSchema, cartItemParamsSchema } from "../schemas/cartSchema";

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemParams = z.infer<typeof cartItemParamsSchema>;
