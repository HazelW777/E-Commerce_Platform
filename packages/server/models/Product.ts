import mongoose, { Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl: string;
  seller: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  deletedAt?: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    imageUrl: { type: String, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
