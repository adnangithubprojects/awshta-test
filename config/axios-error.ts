/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// keeping it any for now coz we dont have its types
export const axiosError = (error: any) => {
  let errorMessage = "An unknown error occurred.";
  if (axios.isAxiosError(error)) {
    errorMessage =
      error.response?.data.error ||
      error.response?.data.error?.meta?.target ||
      error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return errorMessage;
};
