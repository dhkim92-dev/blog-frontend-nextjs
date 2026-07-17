import { NextResponse } from "next/server";
import {
  clearAuthenticationCookies,
  decodeAuthenticationToken,
  getAccessTokenSessionIdFromCookieHeader,
  getApiBaseUrl,
  getAuthenticatedMemberFromCookieHeader,
  getRefreshTokenFromCookieHeader,
  setAuthenticatedMemberCookie,
  setAuthenticationCookies,
} from "@/app/login/auth-session";
import {
  applyRefreshedAuthentication,
  createSessionExpiredResponse,
  fetchApiServer,
  requestAccessTokenReissue,
} from "@/app/login/api-server-fetch";

function getNickname(requestBody: string) {
  try {
    const { nickname } = JSON.parse(requestBody) as { nickname?: unknown };

    return typeof nickname === "string" ? nickname.trim() || null : null;
  } catch {
    return null;
  }
}

export async function forwardMemberRequest(
  request: Request,
  pathname: string,
  init: RequestInit,
  refreshAuthentication = false,
) {
  try {
    const result = await fetchApiServer(
      request,
      new URL(pathname, getApiBaseUrl()),
      { ...init, cache: "no-store" },
    );

    if (result.refreshTokenRemoved) {
      return createSessionExpiredResponse(result.sessionId);
    }

    const response = new NextResponse(await result.upstreamResponse.text() || null, {
      status: result.upstreamResponse.status,
      headers: {
        "content-type": result.upstreamResponse.headers.get("content-type") ?? "",
      },
    });

    if (
      refreshAuthentication &&
      result.upstreamResponse.ok &&
      typeof init.body === "string"
    ) {
      const refreshToken = getRefreshTokenFromCookieHeader(
        request.headers.get("cookie"),
      );

      if (refreshToken) {
        const reissueResult = await requestAccessTokenReissue(refreshToken);

        if (reissueResult.refreshedTokens) {
          await setAuthenticationCookies(
            response.cookies,
            reissueResult.refreshedTokens,
            result.sessionId,
          );
          const authentication =
            decodeAuthenticationToken(reissueResult.refreshedTokens.accessToken) ??
            getAuthenticatedMemberFromCookieHeader(request.headers.get("cookie"));
          const nickname = getNickname(init.body);

          if (authentication && nickname) {
            setAuthenticatedMemberCookie(response.cookies, {
              ...authentication,
              nickname,
            });
          }

          return response;
        }
      }
    }

    await applyRefreshedAuthentication(response.cookies, result);

    return response;
  } catch {
    return NextResponse.json(
      {
        status: 502,
        code: "MEMBER_UPSTREAM_UNAVAILABLE",
        message: "회원 서버에 연결하지 못했습니다.",
        errors: [],
      },
      { status: 502 },
    );
  }
}

export async function forwardMemberDeleteRequest(
  request: Request,
  memberId: string,
) {
  const response = await forwardMemberRequest(
    request,
    `/api/v1/members/${memberId}`,
    { method: "DELETE" },
  );

  if (response.status === 204) {
    await clearAuthenticationCookies(
      response.cookies,
      getAccessTokenSessionIdFromCookieHeader(request.headers.get("cookie")),
    );
  }

  return response;
}
