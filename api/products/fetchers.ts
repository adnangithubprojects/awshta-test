import { API_FORM_URL, API_URL } from "@/config/url-config";

export type TCreateProduct = {
  name: string;
  genericName?: string;
  barcode?: string;
  description?: string;
  unit: string;
  unitsPerPack: number;
  costPrice: number;
  salePrice: number;
  stock: number;
  reorderLevel: number;
  manufacturer?: string;
  batchNo?: string;
  expiryDate?: string | null;
  categoryId: string;
  isActive?: boolean;
  image?: File | null;
};

const axiosError = (error: any) => error;

// Define explicit filter parameters mapping exactly to your API query pattern
export interface TProductFilters {
  page?: number;
  per_page?: number;
  search?: string | null;
  category_id?: string | null;
  min_price?: number | null;
  max_price?: number | null;
  seller_id?: string | null;
  featured?: boolean | null;
  sort_by?: "price" | "avg_rating" | "created_at" | "title";
  sort_order?: "asc" | "desc";
}

export const asyncGetProducts = async (filters: TProductFilters = {}) => {
  try {
    return await API_URL.get("/api/v1/products", {
      params: filters,
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncCreateProduct = async (data: any) => {
  try {
    return await API_URL.post("/api/v1/products", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetProductBySlug = async (slug: string) => {
  try {
    return await API_URL.get(`/api/v1/products/${slug}`, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncUpdateProduct = async (productId: string, data: any) => {
  try {
    return await API_URL.patch(`/api/v1/products/${productId}`, data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncDeleteProduct = async (productId: string) => {
  try {
    return await API_URL.delete(`/api/v1/products/${productId}`, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};
