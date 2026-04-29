import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  price: z.coerce.number().min(0, "Price cannot be negative").multipleOf(0.01, "Price can have at most 2 decimal places"),
  stock: z.coerce
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .default(0),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(["active", "inactive"]).optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
