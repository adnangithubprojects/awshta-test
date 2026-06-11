import { axiosError } from "@/config/axios-error";
import { API_URL } from "@/config/url-config";
import { TCustomerFilters, TSellerFilters, TUserFilters } from "./queries";

export type TBasicResponse<T> = {
  data: T;
};

export type TLoginInput = {
  email: string;
  password: string;
};

export type TAddressInput = {
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default?: boolean;
};

export type TProfileInput = {
  name: string;
  phone: string;
};

export type TPasswordInput = {
  current_password: string;
  new_password: string;
};

export type TForgotPasswordInput = {
  email: string;
};

export type TOtpVerificationInput = {
  email: string;
  otp: string;
};
export interface TUpdateUserInput {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "seller" | "buyer";
  is_active: boolean;
  is_verified: boolean;
}

// import axios from "axios";

// // Assuming BASE_URL and axiosError are defined/imported somewhere in your project
// const BASE_URL = "YOUR_BASE_URL_HERE";
// const axiosError = (error: any) => error;

// --- Addresses ---

export const asyncAuthLogin = async (data: TLoginInput) => {
  try {
    return await API_URL.post("/api/v1/auth/login", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncAuthRefreshToken = async (data: {
  refresh_token: string;
}) => {
  try {
    return await API_URL.post("/api/v1/auth/refresh", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncLogoutUser = async (refreshToken: string) => {
  try {
    const response = await API_URL.post("/api/v1/auth/logout", {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    throw axiosError(error);
  }
};

export const asyncRegisterUser = async (data: FormData) => {
  try {
    return await API_URL.post("/api/v1/auth/register", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncUsersForgetPassword = async (data: TForgotPasswordInput) => {
  try {
    return await API_URL.post("/api/v1/auth/forgot-password", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncUsersOtpVerification = async (
  data: TOtpVerificationInput,
) => {
  try {
    return await API_URL.post("/api/v1/auth/verify-otp", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncResetUserPassword = async (password: string) => {
  try {
    return await API_URL.post(
      "/api/v1/auth/reset-password",
      { password },
      {
        withCredentials: true,
      },
    );
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncAddAddress = async (data: TAddressInput) => {
  try {
    return await API_URL.post("/api/v1/users/me/addresses", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncGetAddresses = async () => {
  try {
    return await API_URL.get("/api/v1/users/me/addresses", {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncDeleteAddress = async (addressId: string) => {
  try {
    return await API_URL.delete(`/api/v1/users/me/addresses/${addressId}`, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

// --- User Profile & Security ---

export const asyncUpdatePassword = async (data: TPasswordInput) => {
  try {
    return await API_URL.patch("/api/v1/users/me/password", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncUpdateAvatar = async (formData: FormData) => {
  try {
    return await API_URL.post("/api/v1/users/me/avatar", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncUpdateProfile = async (data: TProfileInput) => {
  try {
    return await API_URL.patch("/api/v1/users/me", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncGetMyProfile = async () => {
  try {
    const response = await API_URL.get("/api/v1/users/me", {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

// --- Admin / User Management ---

export const asyncGetAllUsers = async (filters: TUserFilters) => {
  try {
    // Construct search string parameters dynamically
    const params = new URLSearchParams();
    params.append("page", filters.page.toString());
    params.append("per_page", filters.per_page.toString());

    if (filters.role) params.append("role", filters.role);
    if (filters.is_active !== null && filters.is_active !== undefined) {
      params.append("is_active", filters.is_active.toString());
    }
    if (filters.search) params.append("search", filters.search);

    // Matches your production base target: https://api.awshta.com/api/v1/admin/users
    const response = await API_URL.get(
      `/api/v1/admin/users?${params.toString()}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncGetUserById = async (userId: string) => {
  try {
    return await API_URL.get(`/api/v1/users/${userId}`, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncLoginUsers = asyncAuthLogin;

export const asyncUpdateUser = async ({
  id,
  data,
}: {
  id: string;
  data: TUpdateUserInput;
}) => {
  const response = await API_URL.patch(`/api/v1/admin/users/${id}`, data);
  return response.data;
};

export const asyncDeleteUser = async (id: string) => {
  const response = await API_URL.delete(`/api/v1/admin/users/${id}`);
  return response.data;
};

export const asyncToggleBlockUser = async (id: string) => {
  const response = await API_URL.patch(
    `/api/v1/admin/users/${id}/toggle-block`,
  );
  return response.data;
};

export const asyncGetSellerRequests = async (filters: TSellerFilters) => {
  try {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      per_page: filters.per_page.toString(),
      status: filters.status,
    });

    const response = await API_URL.get(
      `/api/v1/sellers/seller-requests?${params.toString()}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw axiosError(error);
  }
};
export const asyncGetCustomers = async (filters: TCustomerFilters) => {
  try {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      per_page: filters.per_page.toString(),
    });

    if (filters.search) params.append("search", filters.search);

    const response = await API_URL.get(
      `/api/v1/admin/customers?${params.toString()}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw axiosError(error);
  }
};