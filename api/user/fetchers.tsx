import { axiosError } from "@/config/axios-error";
import { API_URL } from "@/config/url-config";

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

export const asyncAuthRefreshToken = async (data: { refresh_token: string }) => {
  try {
    return await API_URL.post("/api/v1/auth/refresh", data, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

export const asyncAuthLogout = async () => {
  try {
    return await API_URL.post(
      "/api/v1/auth/logout",
      {},
      {
        withCredentials: true,
      },
    );
  } catch (error: unknown) {
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

export const asyncUsersForgetPassword = async (
  data: TForgotPasswordInput,
) => {
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
    return await API_URL.get("/api/v1/users/me", {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw axiosError(error);
  }
};

// --- Admin / User Management ---

export const asyncGetAllUsers = async () => {
  try {
    return await API_URL.get("/api/v1/users", {
      withCredentials: true,
    });
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
