export type KeycloakTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  scope?: string;
};

export type DecodedJwtPayload = {
  exp?: number;
  iat?: number;
  name?: string;
  email?: string;
  preferred_username?: string;
  [key: string]: unknown;
};

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

export function decodeJwtPayload(token?: string | null): DecodedJwtPayload | null {
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(base64UrlDecode(payload)) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

function keycloakIssuer() {
  const issuer = process.env.KEYCLOAK_ISSUER;
  if (!issuer || !issuer.trim()) {
    throw new Error("KEYCLOAK_ISSUER is required.");
  }

  const normalized = issuer.trim().replace(/\/+$/, "");
  const url = new URL(normalized);

  if (!url.protocol.startsWith("http")) {
    throw new Error(`Invalid KEYCLOAK_ISSUER: ${issuer}`);
  }

  return url.toString().replace(/\/+$/, "");
}

export function keycloakTokenEndpoint() {
  return `${keycloakIssuer()}/protocol/openid-connect/token`;
}

export function keycloakLogoutEndpoint() {
  return `${keycloakIssuer()}/protocol/openid-connect/logout`;
}

/** Standard Keycloak realm OIDC paths — avoids slow .well-known discovery on every sign-in. */
export function keycloakOpenIdEndpoints(issuer = keycloakIssuer()) {
  const base = issuer.replace(/\/+$/, "");

  return {
    issuer: base,
    authorization: `${base}/protocol/openid-connect/auth`,
    token: `${base}/protocol/openid-connect/token`,
    userinfo: `${base}/protocol/openid-connect/userinfo`,
    jwks_endpoint: `${base}/protocol/openid-connect/certs`,
    wellKnown: `${base}/.well-known/openid-configuration`,
  };
}

export function keycloakHttpTimeoutMs(): number {
  const configured = Number(process.env.KEYCLOAK_HTTP_TIMEOUT_MS ?? "15000");
  return Number.isFinite(configured) && configured > 0 ? configured : 15000;
}

export async function refreshKeycloakAccessToken(refreshToken: string): Promise<KeycloakTokenResponse> {
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  if (!clientId) {
    throw new Error("KEYCLOAK_CLIENT_ID is required.");
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  if (clientSecret) {
    params.set("client_secret", clientSecret);
  }

  const response = await fetch(keycloakTokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
    signal: AbortSignal.timeout(keycloakHttpTimeoutMs()),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Keycloak refresh failed: ${response.status} ${detail}`.trim());
  }

  return (await response.json()) as KeycloakTokenResponse;
}
