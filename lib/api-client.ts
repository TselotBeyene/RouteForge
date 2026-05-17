import axios from "axios";

export const apiClient = axios.create({
  baseURL: "",
  timeout: 30000
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the backend through the frontend proxy. Confirm the backend is running on http://127.0.0.1:8080.";
    }
    if (error.code === "ECONNABORTED") {
      return "Backend API timed out through the frontend proxy.";
    }
    return error.response?.data?.message || error.message;
  }

  return error instanceof Error ? error.message : "Unexpected API error";
}
