import { accessTokenSessionStore } from "@/app/login/access-token-session-store";
import {
  getBackendApiHost,
  getFrontendCookieDomain,
  getFrontendHost,
} from "@/app/shared/runtime-config";

export type AuthenticationTokenPayload = {
  sub: string;
  memberId?: string | null;
  authAccountId?: string | null;
  nickname?: string | null;
  roles: string[];
};

export type AuthenticationJwtClaims = Record<string, unknown> & {
  sub: string;
  memberId?: string | null;
  authAccountId?: string | null;
  nickname?: string | null;
  roles?: string[];
};

export type LoginTokenPayload = {
  type: string;
  refreshToken: string;
  accessToken: string;
};

type CookieWriter = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax";
      path: string;
      domain?: string;
      maxAge?: number;
    },
  ) => unknown;
};

const CALLBACK_PATH = "/login/callback";
const ACCESS_TOKEN_SESSION_COOKIE_NAME = "access-token-session-id";

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function getGithubOAuthAuthorizeUrl() {
  const url = new URL("/oauth2/authorization/github", getBackendApiHost());

  url.searchParams.set("redirect_uri", `${getFrontendHost()}${CALLBACK_PATH}`);

  return url.toString();
}

function decodeBase64UrlSegment(value: string) {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedValue = normalizedValue.padEnd(
    Math.ceil(normalizedValue.length / 4) * 4,
    "=",
  );

  return Buffer.from(paddedValue, "base64").toString("utf-8");
}

export function decodeAuthenticationJwtClaims(
  accessToken: string,
): AuthenticationJwtClaims | null {
  const tokenSegments = accessToken.split(".");

  if (tokenSegments.length < 2) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(
      decodeBase64UrlSegment(tokenSegments[1]),
    ) as Record<string, unknown>;

    if (typeof parsedPayload.sub !== "string") {
      return null;
    }

    return {
      ...parsedPayload,
      sub: parsedPayload.sub,
      memberId:
        typeof parsedPayload.memberId === "string" || parsedPayload.memberId === null
          ? parsedPayload.memberId
          : null,
      authAccountId:
        typeof parsedPayload.authAccountId === "string" ||
        parsedPayload.authAccountId === null
          ? parsedPayload.authAccountId
          : null,
      nickname:
        typeof parsedPayload.nickname === "string" || parsedPayload.nickname === null
          ? parsedPayload.nickname
          : null,
      roles: Array.isArray(parsedPayload.roles)
        ? parsedPayload.roles.filter(
            (role): role is string => typeof role === "string",
          )
        : undefined,
    };
  } catch {
    return null;
  }
}

export function decodeAuthenticationToken(
  accessToken: string,
): AuthenticationTokenPayload | null {
  const claims = decodeAuthenticationJwtClaims(accessToken);

  if (!claims || !Array.isArray(claims.roles)) {
    return null;
  }

  return {
    sub: claims.sub,
    memberId: claims.memberId ?? null,
    authAccountId: claims.authAccountId ?? null,
    nickname: claims.nickname ?? null,
    roles: claims.roles,
  };
}

export function parseAuthenticatedMemberCookie(
  cookieValue: string | undefined,
): AuthenticationTokenPayload | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(
      decodeURIComponent(cookieValue),
    ) as Partial<AuthenticationTokenPayload>;

    if (
      typeof parsedPayload.sub !== "string" ||
      !Array.isArray(parsedPayload.roles)
    ) {
      return null;
    }

    return {
      sub: parsedPayload.sub,
      memberId: parsedPayload.memberId ?? null,
      authAccountId: parsedPayload.authAccountId ?? null,
      nickname: parsedPayload.nickname ?? null,
      roles: parsedPayload.roles.filter(
        (role): role is string => typeof role === "string",
      ),
    };
  } catch {
    return null;
  }
}

function writeAuthenticatedMemberCookie(
  cookies: CookieWriter,
  payload: AuthenticationTokenPayload,
) {
  cookies.set(
    "authenticated-member",
    encodeURIComponent(JSON.stringify(payload)),
    getAuthenticationCookieOptions(),
  );
}

export function setAuthenticatedMemberCookie(
  cookies: CookieWriter,
  payload: AuthenticationTokenPayload,
) {
  writeAuthenticatedMemberCookie(cookies, payload);
}

export function getAuthenticatedMemberFromCookieHeader(
  cookieHeader: string | null,
) {
  if (!cookieHeader) {
    return null;
  }

  const authenticatedMemberMatch = cookieHeader.match(
    /(?:^|;\s*)authenticated-member=([^;]+)/,
  );

  if (!authenticatedMemberMatch) {
    return null;
  }

  return parseAuthenticatedMemberCookie(authenticatedMemberMatch[1]);
}

function getAuthenticationCookieOptions() {
  return {
    httpOnly: true,
    secure: isProductionEnvironment(),
    sameSite: "lax" as const,
    path: "/",
    domain: getFrontendCookieDomain(),
  };
}

function getRefreshTokenMaxAge(refreshToken: string) {
  const expiresAt = decodeAuthenticationJwtClaims(refreshToken)?.exp;

  if (typeof expiresAt !== "number") {
    return undefined;
  }

  return Math.max(0, Math.floor(expiresAt - Date.now() / 1000));
}

export async function setAuthenticationCookies(
  cookies: CookieWriter,
  tokens: LoginTokenPayload,
  existingSessionId?: string | null,
) {
  const cookieOptions = getAuthenticationCookieOptions();
  const authenticationPayload = decodeAuthenticationToken(tokens.accessToken);
  const sessionId = existingSessionId
    ? existingSessionId
    : await accessTokenSessionStore.create(tokens.accessToken);

  if (existingSessionId) {
    await accessTokenSessionStore.set(existingSessionId, tokens.accessToken);
  }

  cookies.set("refresh-token", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: getRefreshTokenMaxAge(tokens.refreshToken),
  });
  cookies.set(ACCESS_TOKEN_SESSION_COOKIE_NAME, sessionId, cookieOptions);

  if (authenticationPayload) {
    writeAuthenticatedMemberCookie(cookies, authenticationPayload);
  }
}

export async function clearAuthenticationCookies(
  cookies: CookieWriter,
  sessionId?: string | null,
) {
  const cookieOptions = getAuthenticationCookieOptions();
  const expiredCookieOptions = {
    ...cookieOptions,
    maxAge: 0,
  };

  cookies.set("refresh-token", "", expiredCookieOptions);
  cookies.set(ACCESS_TOKEN_SESSION_COOKIE_NAME, "", expiredCookieOptions);
  cookies.set("authenticated-member", "", expiredCookieOptions);

  if (sessionId) {
    await accessTokenSessionStore.delete(sessionId);
  }
}

export function getAccessTokenSessionIdFromCookieHeader(
  cookieHeader: string | null,
) {
  if (!cookieHeader) {
    return null;
  }

  const sessionIdMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ACCESS_TOKEN_SESSION_COOKIE_NAME}=([^;]+)`),
  );

  if (!sessionIdMatch) {
    return null;
  }

  return decodeURIComponent(sessionIdMatch[1]);
}

export function getRefreshTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return null;
  }

  const refreshTokenMatch = cookieHeader.match(
    /(?:^|;\s*)refresh-token=([^;]+)/,
  );

  if (!refreshTokenMatch) {
    return null;
  }

  return decodeURIComponent(refreshTokenMatch[1]);
}

export function buildLoginErrorRedirectUrl(
  origin: string,
  errorCode: string,
  provider?: string | null,
) {
  const url = new URL("/login", origin);

  url.searchParams.set("error", errorCode);

  if (provider) {
    url.searchParams.set("provider", provider);
  }

  return url;
}
