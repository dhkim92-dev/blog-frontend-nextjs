import { NextResponse } from "next/server";
import {
  getApiBaseUrl,
  setAuthenticationCookies,
  type LoginTokenPayload,
} from "@/app/login/auth-session";
import {
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

  try {
    const result = await fetchApiServer(
      request,
      new URL("/api/v1/auth/email-password", getApiBaseUrl()),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      },
    );

    if (result.refreshTokenRemoved) {
      return createSessionExpiredResponse(result.sessionId);
    }

    const responseBody = await parseApiEnvelope<LoginTokenPayload | null>(
      result.upstreamResponse,
    );

    if (!result.upstreamResponse.ok || !responseBody?.payload) {
      return NextResponse.json(
        responseBody ?? {
          code: "LOGIN_FAILED",
          message: "로그인에 실패했습니다.",
          status: result.upstreamResponse.status,
          errors: [],
        },
        { status: result.upstreamResponse.status || 500 },
      );
    }

    const { accessToken, refreshToken } = responseBody.payload;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        {
          code: "LOGIN_TOKEN_PAYLOAD_INVALID",
          message: "인증 토큰을 받지 못했습니다.",
          status: 502,
          errors: [],
        },
        { status: 502 },
      );
    }

    const response = NextResponse.json(responseBody, {
      status: result.upstreamResponse.status,
    });

    await setAuthenticationCookies(
      response.cookies,
      responseBody.payload,
      result.sessionId,
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        code: "LOGIN_UPSTREAM_UNAVAILABLE",
        message: "인증 서버에 연결하지 못했습니다.",
        status: 502,
        errors: [],
      },
      { status: 502 },
    );
  }
}
