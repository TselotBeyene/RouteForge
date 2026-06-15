import type { JWT } from "next-auth/jwt";

export function hasValidAuthToken(token: JWT | null): token is JWT & { accessToken: string } {
  if (!token) {
    return false;
  }

  if (
    token.error === "RefreshAccessTokenError" ||
    token.error === "MissingRefreshToken"
  ) {
    return false;
  }

  return typeof token.accessToken === "string" && token.accessToken.length > 0;
}
