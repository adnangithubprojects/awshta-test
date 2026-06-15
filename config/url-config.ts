import { useAuthStore } from "@/stores/useAuthstore";
import axios from "axios";

export const BASE_URL = "https://awshta.devsment.com";
export const IMAGE_URL = "https://awshta.com/";
// export const BASE_URL = 'http://localhost:8080'

export const API_URL = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const API_FORM_URL = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "content-type": "multipart/form-data",
  },
});

API_URL.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const attachToken = async (config: any) => {
  // Pull the current token instantly from the active Zustand state
  const token = useAuthStore.getState().token;

  // Optional dynamic check if you uncomment later:
  // if (token && isTokenExpired(token)) {
  //   ...
  // }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

API_URL.interceptors.request.use(attachToken, Promise.reject);
API_FORM_URL.interceptors.request.use(attachToken, Promise.reject);
