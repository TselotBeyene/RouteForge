import type { Account, NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";
import {
  keycloakHttpTimeoutMs,
  keycloakOpenIdEndpoints,
  refreshKeycloakAccessToken,
} from "@/lib/auth/keycloak";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function normalizeIssuer(value: string): string {
  const issuer = value.trim().replace(/\/+$/, "");

  try {
    const url = new URL(issuer);

    if (!url.protocol.startsWith("http")) {
      throw new Error();
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    throw new Error(
      `Invalid KEYCLOAK_ISSUER. Expected absolute realm URL like http://172.16.0.58:15080/realms/studio but got: ${value}`
    );
  }
}

function shouldRefreshToken(token: JWT): boolean {
  const expiresAt = typeof token.expiresAt === "number" ? token.expiresAt : 0;

  if (!expiresAt) {
    return false;
  }

  const refreshWindowSeconds = 60;
  return Date.now() >= (expiresAt - refreshWindowSeconds) * 1000;
}

function clearToken(token: JWT): JWT {
  return {
    ...token,
    accessToken: undefined,
    refreshToken: undefined,
    idToken: undefined,
    expiresAt: 0,
    error: "RefreshAccessTokenError",
  };
}

async function refreshToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken || typeof token.refreshToken !== "string") {
    return clearToken(token);
  }

  try {
    const refreshed = await refreshKeycloakAccessToken(token.refreshToken);

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      idToken: refreshed.id_token ?? token.idToken,
      expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
      error: undefined,
    };
  } catch (error) {
    console.error("Failed to refresh Keycloak access token", error);
    return clearToken(token);
  }
}

const keycloakIssuer = normalizeIssuer(requiredEnv("KEYCLOAK_ISSUER"));
const keycloakOidc = keycloakOpenIdEndpoints(keycloakIssuer);

export const authOptions: NextAuthOptions = {
  secret: requiredEnv("NEXTAUTH_SECRET"),

  providers: [
    KeycloakProvider({
      clientId: requiredEnv("KEYCLOAK_CLIENT_ID"),
      clientSecret: requiredEnv("KEYCLOAK_CLIENT_SECRET"),
      issuer: keycloakOidc.issuer,
      // Skip Issuer.discover() — it was timing out at 3.5s when Keycloak is slow or on another network.
      wellKnown: undefined,
      authorization: {
        url: keycloakOidc.authorization,
        params: {
          scope: "openid email profile",
          // Uses keycloak/themes/studio — set Login theme = studio in realm settings.
          kc_theme: "studio",
        },
      },
      token: keycloakOidc.token,
      userinfo: keycloakOidc.userinfo,
      jwks_endpoint: keycloakOidc.jwks_endpoint,
      httpOptions: {
        timeout: keycloakHttpTimeoutMs(),
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({
      token,
      account,
      user,
    }: {
      token: JWT;
      account: Account | null;
      user?: User;
    }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          expiresAt: account.expires_at,
          error: undefined,
          name: user?.name ?? token.name,
          email: user?.email ?? token.email,
          picture: user?.image ?? token.picture,
        };
      }

      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      if (!shouldRefreshToken(token)) {
        return token;
      }

      return refreshToken(token);
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      session.error =
        typeof token.error === "string" ? token.error : undefined;

      if (session.user) {
        session.user.name =
          typeof token.name === "string" ? token.name : session.user.name;
        session.user.email =
          typeof token.email === "string" ? token.email : session.user.email;
        session.user.image =
          typeof token.picture === "string"
            ? token.picture
            : session.user.image;
      }

      return session;
    },
  },
};