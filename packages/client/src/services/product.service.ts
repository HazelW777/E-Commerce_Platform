import apiClient from "../lib/apiClient";

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  seller: string | { _id: string; email: string };
  status: "active" | "inactive";
  createdAt: string;
}

interface ProductListResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
}

export const productApi = {
  getMyProducts: async (query: ProductQuery = {}): Promise<ProductListResponse> => {
    const res = await apiClient.get<ProductListResponse>("/api/products/my/list", { params: query });
    return res.data;
  },

  getProducts: async (query: ProductQuery = {}): Promise<ProductListResponse> => {
    const res = await apiClient.get<ProductListResponse>("/api/products", { params: query });
    return res.data;
  },

  deactivateProduct: async (id: string): Promise<void> => {
    await apiClient.put(`/api/products/${id}`, { status: "inactive" });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
};
