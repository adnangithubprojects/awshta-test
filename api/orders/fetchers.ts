import { axiosError } from "@/config/axios-error";
import { API_URL } from "@/config/url-config";

export interface TOrderFilters {
  page?: number;
  per_page?: number;
}

export interface TAddress {
  label: "home" | "office" | "other";
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
}

export interface TCreateOrderInput {
  items: Array<{ product_id: string; quantity: number }>;
  payment_method: "cod" | "card" | "wallet";
  shipping_address: TAddress;
  notes?: string | null;
}

export const asyncGetSummary = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const q = new URLSearchParams();
    if (params?.startDate) q.set("startDate", params.startDate);
    if (params?.endDate) q.set("endDate", params.endDate);
    const response = await API_URL.get(
      `/api/v1/reports/summary?${q.toString()}`,
    );
    return response.data?.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const asyncGetOrders = async (filters: TOrderFilters = {}) => {
  try {
    return await API_URL.get("/api/v1/orders", {
      params: filters,
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncCreateOrder = async (data: TCreateOrderInput) => {
  try {
    return await API_URL.post("/api/v1/orders", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetOrderDetails = async (orderId: string) => {
  try {
    return await API_URL.get(`/api/v1/orders/${orderId}`, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncUpdateOrderStatus = async (
  orderId: string,
  status: string,
) => {
  try {
    return await API_URL.patch(
      `/api/v1/orders/${orderId}/status`,
      { status },
      { withCredentials: true },
    );
  } catch (error: any) {
    throw axiosError(error);
  }
};
