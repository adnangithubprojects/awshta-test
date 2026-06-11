/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from "@/stores/useAuthstore";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
export const IMAGE_URL = "https://api.awshta.com";

export const BASE_URL = "https://awshta.devsment.com";

export const API_URL: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const API_FORM_URL: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// --- Request Interceptor ---
const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().access_token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const handleResponseError = (error: any) => {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401 || detail === "Invalid or expired access token") {
    const pathname = window.location.pathname;

    useAuthStore.getState().logout?.();

    if (pathname !== "/login") {
      history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  return Promise.reject(error);
};

API_URL.interceptors.request.use(attachToken, (err) => Promise.reject(err));
API_FORM_URL.interceptors.request.use(attachToken, (err) =>
  Promise.reject(err),
);

API_URL.interceptors.response.use((res) => res, handleResponseError);
API_FORM_URL.interceptors.response.use((res) => res, handleResponseError);

export default API_URL;
