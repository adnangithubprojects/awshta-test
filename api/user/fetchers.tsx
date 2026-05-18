import { axiosError } from "@/config/axios-error";
import { API_FORM_URL, API_URL, BASE_URL } from "@/config/url-config";
import { TUser } from "@/types";
import axios from "axios";

export type TBasicResponse<T> = {
  data: T;
};
// import axios from "axios";

// // Assuming BASE_URL and axiosError are defined/imported somewhere in your project
// const BASE_URL = "YOUR_BASE_URL_HERE";
// const axiosError = (error: any) => error;

// --- Addresses ---

export const asyncAuthLogin = async (data: any) => {
  try {
    return await API_URL.post("/api/v1/auth/login", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncAuthRefreshToken = async (data: any) => {
  try {
    return await API_URL.post("/api/v1/auth/refresh", data, {
      withCredentials: true,
    });
  } catch (error: any) {
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
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncAddAddress = async (data: any) => {
  try {
    return await axios.post(BASE_URL + "/api/v1/users/me/addresses", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetAddresses = async () => {
  try {
    return await axios.get(BASE_URL + "/api/v1/users/me/addresses", {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncDeleteAddress = async (addressId: string) => {
  try {
    return await axios.delete(
      BASE_URL + `/api/v1/users/me/addresses/${addressId}`,
      {
        withCredentials: true,
      },
    );
  } catch (error: any) {
    throw axiosError(error);
  }
};

// --- User Profile & Security ---

export const asyncUpdatePassword = async (data: any) => {
  try {
    return await axios.patch(BASE_URL + "/api/v1/users/me/password", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncUpdateAvatar = async (formData: FormData) => {
  try {
    return await axios.post(BASE_URL + "/api/v1/users/me/avatar", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncUpdateProfile = async (data: any) => {
  try {
    return await axios.patch(BASE_URL + "/api/v1/users/me", data, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetMyProfile = async () => {
  try {
    return await axios.get(BASE_URL + "/api/v1/users/me", {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

// --- Admin / User Management ---

export const asyncGetAllUsers = async () => {
  try {
    return await axios.get(BASE_URL + "/api/v1/users", {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};

export const asyncGetUserById = async (userId: string) => {
  try {
    return await axios.get(BASE_URL + `/api/v1/users/${userId}`, {
      withCredentials: true,
    });
  } catch (error: any) {
    throw axiosError(error);
  }
};
