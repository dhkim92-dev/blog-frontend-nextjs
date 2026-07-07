import { NextResponse } from "next/server";
import {
  clearAuthenticationCookies,
  getAccessTokenSessionIdFromCookieHeader,
  getApiBaseUrl,
  getRefreshTokenFromCookieHeader,
} from "@/app/login/auth-session";

async function handleLogoutRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const sessionId = getAccessTokenSessionIdFromCookieHeader(cookieHeader);
  const response = new NextResponse(null, {
    status: 204,
  });

  if (!getRefreshTokenFromCookieHeader(cookieHeader)) {
    await clearAuthenticationCookies(response.cookies, sessionId);

    return response;
  }

  try {
    const revokeResponse = await fetch(
      new URL("/api/v1/auht/jwt/revoke", getApiBaseUrl()),
      {
        method: "DELETE",
        cache: "no-store",
        headers: new Headers({
          Accept: "application/json",
          Cookie: cookieHeader ?? "",
        }),
      },
    );

    if (revokeResponse.status !== 204) {
      console.warn("[auth/logout] upstream logout returned non-204", {
        status: revokeResponse.status,
      });
    }
  } catch {
    console.warn("[auth/logout] upstream logout request failed");
  }

  await clearAuthenticationCookies(response.cookies, sessionId);

  return response;
}

export async function POST(request: Request) {
  return handleLogoutRequest(request);
}

export async function DELETE(request: Request) {
  return handleLogoutRequest(request);
}
