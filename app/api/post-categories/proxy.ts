import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/app/login/auth-session";
import {
  applyRefreshedAuthentication,
  createSessionExpiredResponse,
  fetchApiServer,
} from "@/app/login/api-server-fetch";

export async function forwardPostCategoryApiRequest(
  request: Request,
  pathname: string,
  init: RequestInit,
) {
  const upstreamUrl = new URL(pathname, getApiBaseUrl());
  let result: Awaited<ReturnType<typeof fetchApiServer>>;

  try {
    result = await fetchApiServer(request, upstreamUrl, {
      ...init,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        status: 502,
        code: "POST_CATEGORY_UPSTREAM_UNAVAILABLE",
        message: "카테고리 서버에 연결하지 못했습니다.",
        errors: [],
      },
      { status: 502 },
    );
  }

  if (result.refreshTokenRemoved) {
    return createSessionExpiredResponse(result.sessionId);
  }

  const responseText = await result.upstreamResponse.text();
  const response = new NextResponse(responseText || null, {
    status: result.upstreamResponse.status,
  });
  const contentType = result.upstreamResponse.headers.get("content-type");

  if (contentType) {
    response.headers.set("content-type", contentType);
  }

  await applyRefreshedAuthentication(response.cookies, result);

  return response;
}
