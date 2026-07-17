import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/app/login/auth-session";
import {
  applyRefreshedAuthentication,
  appendRefreshTokenSetCookies,
  createSessionExpiredResponse,
  fetchApiServer,
} from "@/app/login/api-server-fetch";

type ApiRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyApiRequest(request: Request, context: ApiRouteContext) {
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `/api/v1/${path.map(encodeURIComponent).join("/")}`,
    getApiBaseUrl(),
  );
  upstreamUrl.search = requestUrl.search;
  const contentType = request.headers.get("content-type");
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  try {
    const result = await fetchApiServer(request, upstreamUrl, {
      method: request.method,
      headers: contentType ? { "Content-Type": contentType } : undefined,
      body,
      cache: "no-store",
    });

    if (result.sessionExpired) {
      return createSessionExpiredResponse(result.sessionId);
    }

    const responseText = await result.upstreamResponse.text();
    const response = new NextResponse(responseText || null, {
      status: result.upstreamResponse.status,
    });
    const upstreamContentType = result.upstreamResponse.headers.get(
      "content-type",
    );

    if (upstreamContentType) {
      response.headers.set("content-type", upstreamContentType);
    }

    appendRefreshTokenSetCookies(response.headers, result.refreshTokenSetCookies);
    await applyRefreshedAuthentication(response.cookies, result);

    return response;
  } catch {
    return NextResponse.json(
      {
        status: 502,
        code: "API_UPSTREAM_UNAVAILABLE",
        message: "API 서버에 연결하지 못했습니다.",
        errors: [],
      },
      { status: 502 },
    );
  }
}aa

export const GET = proxyApiRequest;
export const POST = proxyApiRequest;
export const PUT = proxyApiRequest;
export const PATCH = proxyApiRequest;
export const DELETE = proxyApiRequest;
