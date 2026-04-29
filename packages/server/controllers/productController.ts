import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import Product from "../models/Product";
import AppError from "../utils/AppError";
import { productQuerySchema } from "@project1/shared";

const deleteUploadedFile = (imageUrl: string): void => {
  const filePath = path.join(process.cwd(), imageUrl);
  fs.unlink(filePath, () => {});
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const query = productQuerySchema.parse(req.query);
  const { page, limit, search, status } = query;

  const filter: Record<string, unknown> = { status: status ?? "active", deletedAt: null };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("seller", "email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({ success: true, data: products, total, page, limit });
};

export const getMyProducts = async (req: Request, res: Response): Promise<void> => {
  const query = productQuerySchema.parse(req.query);
  const { page, limit, search, status } = query;

  const filter: Record<string, unknown> = { seller: req.user!.id, deletedAt: null };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({ success: true, data: products, total, page, limit });
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id).populate("seller", "email");
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, data: product });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) throw new AppError("Product image is required", 400);

  const { name, description, price, stock } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    imageUrl,
    seller: req.user!.id,
  });

  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);

  const isSeller = product.seller.toString() === req.user!.id;
  const isAdmin = req.user!.role === "admin";
  if (!isSeller && !isAdmin) throw new AppError("You can only update your own products", 403);

  const { name, description, price, stock, status } = req.body;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (status !== undefined) product.status = status;
  if (req.file) {
    if (product.imageUrl) deleteUploadedFile(product.imageUrl);
    product.imageUrl = `/uploads/${req.file.filename}`;
  }

  await product.save();
  res.json({ success: true, data: product });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);

  const isSeller = product.seller.toString() === req.user!.id;
  const isAdmin = req.user!.role === "admin";
  if (!isSeller && !isAdmin) throw new AppError("You can only delete your own products", 403);

  product.deletedAt = new Date();
  await product.save();
  res.json({ success: true, message: "Product deleted successfully" });
};
