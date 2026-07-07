import { NextResponse } from "next/server";
import {
  getApiBaseUrl,
  isProductionEnvironment,
  setAuthenticationCookies,
  type LoginTokenPayload,
} from "@/app/login/auth-session";
import {
  applyRefreshedAuthentication,
  createSessionExpiredResponse,
  fetchApiServer,
} from "@/app/login/api-server-fetch";
import { parseApiEnvelope } from "@/app/shared/api-envelope";

type EmailPasswordLoginRequest = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  const requestBody = (await request.json()) as EmailPasswordLoginRequest;
  const apiBaseUrl = getApiBaseUrl();
  const upstreamUrl = new URL("/api/v1/auth/email-password", apiBaseUrl);
  const isProduction = isProductionEnvironment();
  let refreshTokenRemoved = false;
  let refreshedTokens: LoginTokenPayload | null = null;
  let sessionId: string | null = null;

  console.info("[auth/email-password] incoming request", {
    email: requestBody.email,
  });
  console.info("[auth/email-password] forwarding to upstream", {
    apiBaseUrl,
    url: upstreamUrl.toString(),
  });

  let apiResponse: Response;

  try {
    const result = await fetchApiServer(request, upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    apiResponse = result.upstreamResponse;
    refreshTokenRemoved = result.refreshTokenRemoved;
    refreshedTokens = result.refreshedTokens;
    sessionId = result.sessionId;

    if (refreshTokenRemoved) {
      console.warn("[auth/email-password] upstream removed refresh-token");
    }
  } catch (error) {
    console.error("[auth/email-password] upstream request failed", {
      apiBaseUrl,
      url: upstreamUrl.toString(),
      error,
    });

    const response = NextResponse.json(
      {
        code: "LOGIN_UPSTREAM_UNAVAILABLE",
        message: "인증 서버에 연결하지 못했습니다.",
        status: 502,
        errors: [],
      },
      { status: 502 },
    );

    if (!isProduction) {
      response.headers.set("x-auth-upstream-url", upstreamUrl.toString());
      response.headers.set("x-auth-upstream-status", "fetch-failed");
    }

    return response;
  }

  const responseBody = await parseApiEnvelope<LoginTokenPayload | null>(
    apiResponse,
  );

  console.info("[auth/email-password] upstream response received", {
    apiBaseUrl,
    url: upstreamUrl.toString(),
    status: apiResponse.status,
    ok: apiResponse.ok,
    code: responseBody?.code ?? null,
    refreshTokenRemoved,
  });

  if (refreshTokenRemoved) {
    const response = await createSessionExpiredResponse(sessionId);

    if (!isProduction) {
      response.headers.set("x-auth-upstream-url", upstreamUrl.toString());
      response.headers.set("x-auth-upstream-status", String(apiResponse.status));
    }

    return response;
  }

  if (!apiResponse.ok) {
    const response = NextResponse.json(
      responseBody ?? {
        code: "LOGIN_FAILED",
        message: "로그인에 실패했습니다.",
        status: apiResponse.status,
        errors: [],
      },
      { status: apiResponse.status || 500 },
    );

    if (!isProduction) {
      response.headers.set("x-auth-upstream-url", upstreamUrl.toString());
      response.headers.set("x-auth-upstream-status", String(apiResponse.status));
    }

    return response;
  }

  if (
    !responseBody?.payload?.accessToken ||
    !responseBody.payload.refreshToken
  ) {
    const response = NextResponse.json(
      {
        code: "LOGIN_TOKEN_PAYLOAD_INVALID",
        message: "인증 토큰을 받지 못했습니다.",
        status: 502,
        errors: [],
      },
      { status: 502 },
    );

    if (!isProduction) {
      response.headers.set("x-auth-upstream-url", upstreamUrl.toString());
      response.headers.set("x-auth-upstream-status", "invalid-payload");
    }

    return response;
  }

  const response = NextResponse.json(responseBody, {
    status: apiResponse.status,
  });

  if (!isProduction) {
    response.headers.set("x-auth-upstream-url", upstreamUrl.toString());
    response.headers.set("x-auth-upstream-status", String(apiResponse.status));
  }

  await setAuthenticationCookies(response.cookies, responseBody.payload, sessionId);
  await applyRefreshedAuthentication(response.cookies, {
    upstreamResponse: apiResponse,
    refreshTokenRemoved,
    refreshedTokens,
    sessionId,
  });

  return response;
}
