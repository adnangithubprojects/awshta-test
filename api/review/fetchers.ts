import { axiosError } from "@/config/axios-error";
import { API_URL } from "@/config/url-config";

export interface TReviewFilters {
  page?: number;
  per_page?: number;
}

export const asyncCreateReview = async (data: any) => {
  try {
    return await API_URL.post("/api/v1/reviews", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetProductReviews = async (
  productId: string,
  filters: TReviewFilters = {},
) => {
  try {
    return await API_URL.get(`/api/v1/reviews/product/${productId}`, {
      params: filters,
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncUpdateReview = async (reviewId: string, data: any) => {
  try {
    return await API_URL.patch(`/api/v1/reviews/${reviewId}`, data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncDeleteReview = async (reviewId: string) => {
  try {
    return await API_URL.delete(`/api/v1/reviews/${reviewId}`, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};
