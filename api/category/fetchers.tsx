import { axiosError } from "@/config/axios-error";
import { API_URL, BASE_URL } from "@/config/url-config";

export const asyncGetCategories = async () => {
  try {
    return await API_URL.get("/api/v1/categories", {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncCreateCategory = async (data: any) => {
  try {
    return await API_URL.post("/api/v1/categories", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetCategoriesTree = async () => {
  try {
    return await API_URL.get("/api/v1/categories/tree-list", {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetCategoryById = async (categoryId: string) => {
  try {
    return await API_URL.get(`/api/v1/categories/${categoryId}`, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncUpdateCategory = async (categoryId: string, data: any) => {
  try {
    return await API_URL.patch(`/api/v1/categories/${categoryId}`, data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncDeleteCategory = async (categoryId: string) => {
  try {
    return await API_URL.delete(`/api/v1/categories/${categoryId}`, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncUpdateCategoryImage = async (
  categoryId: string,
  formData: FormData,
) => {
  try {
    return await API_URL.post(
      `/api/v1/categories/${categoryId}/image`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  } catch (error: any) {
    throw axiosError(error);
  }
};
