import { axiosError } from "@/config/axios-error";
import API_URL from "@/config/url-config";
import { TContactFilters } from "./queries";

export const asyncGetContactMessages = async (filters: TContactFilters) => {
  try {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      per_page: filters.per_page.toString(),
    });
    if (filters.status) params.append("status", filters.status);

    const response = await API_URL.get(
      `/api/v1/contact/messages?${params.toString()}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw axiosError(error);
  }
};
