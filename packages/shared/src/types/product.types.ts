import { z } from "zod";
import { createProductSchema, updateProductSchema, productQuerySchema } from "../schemas/productSchema";

export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
export type ProductQueryInput = z.input<typeof productQuerySchema>;
