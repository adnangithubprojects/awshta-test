import axios from "axios";

export const BASE_URL = "https://api.awshta.com";
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
