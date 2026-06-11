import { axiosError } from "@/config/axios-error";

import API_URL from "@/config/url-config";

import { TAdminOrderFilters } from "@/types/order";

export const asyncGetAdminOrders = async (filters: TAdminOrderFilters) => {
  try {
    const params = new URLSearchParams({
      page: filters.page.toString(),

      per_page: filters.per_page.toString(),
    });

    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);

    if (filters.payment_status)
      params.append("payment_status", filters.payment_status);

    if (filters.user_id) params.append("user_id", filters.user_id);

    const response = await API_URL.get(
      `/api/v1/orders/admin?${params.toString()}`,

      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncGetSingleOrder = async (id: string) => {
  try {
    const response = await API_URL.get(`/api/v1/orders/${id}`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncGetSummary = async (params?: {
  startDate?: string;

  endDate?: string;
}) => {
  try {
    const q = new URLSearchParams();

    if (params?.startDate) q.set("startDate", params.startDate);

    if (params?.endDate) q.set("endDate", params.endDate);

    const response = await API_URL.get(
      `/api/v1/dashboard/overview?${q.toString()}`,
    );

    return response.data?.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
