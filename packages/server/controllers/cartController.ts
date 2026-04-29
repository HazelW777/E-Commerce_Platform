import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Coupon from "../models/Coupon";
import AppError from "../utils/AppError";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await Cart.findOne({ user: req.user!.id }).populate(
    "items.product",
    "name price imageUrl stock",
  );
  res.json({ success: true, data: cart ?? { user: req.user!.id, items: [] } });
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || product.deletedAt)
    throw new AppError("Product not found", 404);
  if (product.stock < quantity) throw new AppError("Insufficient stock", 400);

  let cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user!.id, items: [] });
  }

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) throw new AppError("Insufficient stock", 400);
    existing.quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product", "name price imageUrl stock");
  res.json({ success: true, data: cart });
};

export const updateCartItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) throw new AppError("Quantity must be at least 1", 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  if (quantity > product.stock) throw new AppError("Insufficient stock", 400);

  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) throw new AppError("Cart not found", 404);

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new AppError("Item not in cart", 404);

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product", "name price imageUrl stock");
  res.json({ success: true, data: cart });
};

export const removeFromCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) throw new AppError("Cart not found", 404);

  await cart.removeItem(String(req.params.productId));
  await cart.populate("items.product", "name price imageUrl stock");
  res.json({ success: true, data: cart });
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) throw new AppError("Cart not found", 404);
  await cart.clearCart();
  res.json({ success: true, data: cart });
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const { couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user!.id }).populate(
    "items.product",
    "name price stock deletedAt",
  );
  if (!cart || cart.items.length === 0)
    throw new AppError("Cart is empty", 400);

  const errors: string[] = [];

  for (const item of cart.items) {
    const product = item.product as unknown as {
      _id: string;
      name: string;
      price: number;
      stock: number;
      deletedAt?: Date;
    };
    if (product.deletedAt) {
      errors.push(`"${product.name}" is no longer available`);
    } else if (product.stock < item.quantity) {
      errors.push(
        `"${product.name}": only ${product.stock} left in stock (requested ${item.quantity})`,
      );
    }
  }

  if (couponCode) {
    const subtotal = cart.items.reduce((sum, item) => {
      const p = item.product as unknown as { price: number };
      return sum + p.price * item.quantity;
    }, 0);
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon || !coupon.isValid()) {
      errors.push(`Coupon "${couponCode}" is invalid or expired`);
    } else if (!coupon.isUsable(subtotal)) {
      errors.push(
        `Coupon "${couponCode}" requires a minimum order of $${coupon.minOrderAmount}`,
      );
    }
  }

  if (errors.length > 0) {
    throw new AppError("Checkout failed: " + errors.join("; "), 400);
  }

  for (const item of cart.items) {
    const product = item.product as unknown as { _id: string };
    await Product.findByIdAndUpdate(product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  await cart.clearCart();
  res.json({ success: true, message: "Order placed successfully" });
};
