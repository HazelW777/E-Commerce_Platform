import express from "express";
import upload from "../middleware/uploadImages";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "@project1/shared";
import {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = express.Router();

// public
router.get("/", getProducts);
router.get("/:id", getProductById);

// seller only
router.get("/my/list", protect, restrictTo("seller"), getMyProducts);
router.post("/", protect, restrictTo("seller"), upload.single("image"), validate(createProductSchema), createProduct);

// seller (own) or admin
router.put("/:id", protect, restrictTo("seller", "admin"), upload.single("image"), validate(updateProductSchema), updateProduct);
router.delete("/:id", protect, restrictTo("seller", "admin"), deleteProduct);

export default router;
