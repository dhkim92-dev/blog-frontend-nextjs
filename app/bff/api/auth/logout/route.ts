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
  const response = new NextResponse(null, { status: 204 });

  if (getRefreshTokenFromCookieHeader(cookieHeader)) {
    try {
      await fetch(new URL("/api/v1/auth/jwt/revoke", getApiBaseUrl()), {
        method: "DELETE",
        cache: "no-store",
        headers: { Accept: "application/json", Cookie: cookieHeader ?? "" },
      });
    } catch {
      // The local session must still be cleared when the API server is unavailable.
    }
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
