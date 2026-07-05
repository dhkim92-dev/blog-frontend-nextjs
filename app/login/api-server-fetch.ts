import { NextResponse } from "next/server";
import {
  clearAuthenticationCookies,
  getApiBaseUrl,
  getAccessTokenSessionIdFromCookieHeader,
  getRefreshTokenFromCookieHeader,
  setAuthenticationCookies,
  type LoginTokenPayload,
} from "@/app/login/auth-session";
import { accessTokenSessionStore } from "@/app/login/access-token-session-store";

type ApiServerFetchResult = {
  upstreamResponse: Response;
  refreshTokenRemoved: boolean;
  refreshedTokens: LoginTokenPayload | null;
  sessionId: string | null;
};

type ErrorResponse = {
  code: string;
  message: string;
  status: number;
  errors?: unknown[];
};

type TokenResponse = {
  status: number;
  payload:
    | {
        type: string;
        refreshToken?: string;
        accessToken: string;
      }
    | null;
  code: string;
  message?: string | null;
};

function maskTokenForLog(token: string | null) {
  if (!token) {
    return null;
  }

  if (token.length <= 8) {
    return `${"*".repeat(token.length)}(len=${token.length})`;
  }

  return `${token.slice(0, 4)}...${token.slice(-4)}(len=${token.length})`;
}

function isTokenResponse(
  responseBody: TokenResponse | ErrorResponse | null,
): responseBody is TokenResponse {
  return typeof responseBody === "object" && responseBody !== null && "payload" in responseBody;
}

function hasRefreshTokenRemoval(setCookieHeaders: string[]) {
  return setCookieHeaders.some((value) =>
    /^refresh-token=;/i.test(value.trim()),
  );
}

async function parseJsonResponse<T>(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return null;
  }
}

function createAuthHeaders(
  initHeaders: HeadersInit | undefined,
  accessToken: string | null,
  refreshToken: string | null,
) {
  const headers = new Headers(initHeaders);

  headers.set("Accept", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  if (refreshToken) {
    headers.set("Cookie", `refresh-token=${encodeURIComponent(refreshToken)}`);
  } else {
    headers.delete("Cookie");
  }

  return headers;
}

export async function requestAccessTokenReissue(refreshToken: string) {
  const reissueUrl = new URL("/api/v1/auth/jwt/reissue", getApiBaseUrl());

  console.info("[auth/reissue] requesting access token reissue", {
    url: reissueUrl.toString(),
    refreshToken: maskTokenForLog(refreshToken),
  });

  const reissueResponse = await fetch(reissueUrl, {
    method: "POST",
    headers: createAuthHeaders(
      {
        "Content-Type": "application/json",
      },
      null,
      refreshToken,
    ),
    body: JSON.stringify({
      refreshToken: "",
    }),
    cache: "no-store",
  });
  const responseBody = await parseJsonResponse<TokenResponse | ErrorResponse>(
    reissueResponse,
  );
  const refreshTokenRemoved = hasRefreshTokenRemoval(
    reissueResponse.headers.getSetCookie(),
  );

  console.info("[auth/reissue] response received", {
    url: reissueUrl.toString(),
    status: reissueResponse.status,
    ok: reissueResponse.ok,
    code: responseBody?.code ?? null,
    refreshTokenRemoved,
    hasAccessToken: Boolean(
      isTokenResponse(responseBody) && responseBody.payload?.accessToken,
    ),
  });

  if (
    !reissueResponse.ok ||
    !isTokenResponse(responseBody) ||
    !responseBody.payload?.accessToken
  ) {
    return {
      refreshedTokens: null,
      refreshTokenRemoved,
    };
  }

  return {
    refreshedTokens: {
      type: responseBody.payload.type,
      accessToken: responseBody.payload.accessToken,
      refreshToken,
    },
    refreshTokenRemoved,
  };
}

export async function fetchApiServer(
  request: Request,
  input: URL | string,
  init: RequestInit,
): Promise<ApiServerFetchResult> {
  const cookieHeader = request.headers.get("cookie");
  const sessionId = getAccessTokenSessionIdFromCookieHeader(cookieHeader);
  const accessTokenSession = sessionId
    ? await accessTokenSessionStore.get(sessionId)
    : null;
  const accessToken = accessTokenSession?.accessToken ?? null;
  const refreshToken = getRefreshTokenFromCookieHeader(cookieHeader);
  const upstreamResponse = await fetch(input, {
    ...init,
    headers: createAuthHeaders(init.headers, accessToken, refreshToken),
  });
  const initialRefreshTokenRemoved = hasRefreshTokenRemoval(
    upstreamResponse.headers.getSetCookie(),
  );

  if (initialRefreshTokenRemoved) {
    return {
      upstreamResponse,
      refreshTokenRemoved: true,
      refreshedTokens: null,
      sessionId,
    };
  }

  if (upstreamResponse.status !== 401 || !refreshToken) {
    return {
      upstreamResponse,
      refreshTokenRemoved: false,
      refreshedTokens: null,
      sessionId,
    };
  }

  const reissueResult = await requestAccessTokenReissue(refreshToken);

  if (!reissueResult.refreshedTokens || reissueResult.refreshTokenRemoved) {
    return {
      upstreamResponse,
      refreshTokenRemoved: reissueResult.refreshTokenRemoved,
      refreshedTokens: null,
      sessionId,
    };
  }

  const retryResponse = await fetch(input, {
    ...init,
    headers: createAuthHeaders(
      init.headers,
      reissueResult.refreshedTokens.accessToken,
      reissueResult.refreshedTokens.refreshToken,
    ),
  });
  const retryRefreshTokenRemoved = hasRefreshTokenRemoval(
    retryResponse.headers.getSetCookie(),
  );

  return {
    upstreamResponse: retryResponse,
    refreshTokenRemoved: retryRefreshTokenRemoved,
    refreshedTokens: reissueResult.refreshedTokens,
    sessionId,
  };
}

export async function createSessionExpiredResponse(sessionId?: string | null) {
  const response = NextResponse.json(
    {
      code: "SESSION_EXPIRED",
      message: "세션이 만료되었습니다.",
      status: 401,
      errors: [],
    },
    { status: 401 },
  );

  await clearAuthenticationCookies(response.cookies, sessionId);
  response.headers.set("x-session-expired", "true");

  return response;
}

export async function applyRefreshedAuthentication(
  cookies: Parameters<typeof setAuthenticationCookies>[0],
  result: ApiServerFetchResult,
) {
  if (!result.refreshedTokens) {
    return;
  }

  await setAuthenticationCookies(
    cookies,
    result.refreshedTokens,
    result.sessionId,
  );
}
