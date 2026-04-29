import mongoose, { Document } from "mongoose";

interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  removeItem(productId: string): Promise<ICart>;
  clearCart(): Promise<ICart>;
}

const cartItemSchema = new mongoose.Schema<ICartItem>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema<ICart>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

cartSchema.methods.removeItem = function (productId: string): Promise<ICart> {
  this.items = this.items.filter(
    (item: ICartItem) => item.product.toString() !== productId,
  );
  return this.save();
};

cartSchema.methods.clearCart = function (): Promise<ICart> {
  this.items = [];
  return this.save();
};

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
