import axios from "axios";

let authRedirectInProgress = false;

function redirectToSessionExpired() {
  if (typeof window === "undefined" || authRedirectInProgress) return;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return;

  authRedirectInProgress = true;
  const callbackUrl = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/api/auth/session-expired?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export const apiClient = axios.create({
  baseURL: "/api/bff",
  timeout: 30000,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const action = error.response.headers?.["x-auth-action"];
      const message = (error.response.data as any)?.message ?? "";

      if (
        action === "session-expired" ||
        action === "login" ||
        message.toLowerCase().includes("session expired") ||
        message.toLowerCase().includes("authentication required") ||
        message.toLowerCase().includes("missing backend access token")
      ) {
        redirectToSessionExpired();
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the backend through the secure frontend BFF. Confirm the frontend and backend are running.";
    }

    if (error.code === "ECONNABORTED") {
      return "Backend API timed out through the secure frontend BFF.";
    }

    const data = error.response?.data as any;
    return data?.statusDesc || data?.message || error.message;
  }

  return error instanceof Error ? error.message : "Unexpected API error";
}
