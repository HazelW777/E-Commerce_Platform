import apiClient from "../lib/apiClient";
import { AddToCartInput, UpdateCartItemInput } from "@project1/shared";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface CartData {
  _id?: string;
  user: string;
  items: CartItem[];
}

export const cartApi = {
  getCart: async (): Promise<CartData> => {
    const res = await apiClient.get<{ success: boolean; data: CartData }>(
      "/api/cart",
    );
    return res.data.data;
  },

  addToCart: async (input: AddToCartInput): Promise<CartData> => {
    const res = await apiClient.post<{ success: boolean; data: CartData }>(
      "/api/cart/items",
      input,
    );
    return res.data.data;
  },

  updateCartItem: async (
    productId: string,
    input: UpdateCartItemInput,
  ): Promise<CartData> => {
    const res = await apiClient.put<{ success: boolean; data: CartData }>(
      `/api/cart/items/${productId}`,
      input,
    );
    return res.data.data;
  },

  removeFromCart: async (productId: string): Promise<CartData> => {
    const res = await apiClient.delete<{ success: boolean; data: CartData }>(
      `/api/cart/items/${productId}`,
    );
    return res.data.data;
  },

  clearCart: async (): Promise<CartData> => {
    const res = await apiClient.delete<{ success: boolean; data: CartData }>(
      "/api/cart",
    );
    return res.data.data;
  },
};
