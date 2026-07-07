import { NextResponse } from "next/server";
import {
  clearAuthenticationCookies,
  decodeAuthenticationToken,
  getAccessTokenSessionIdFromCookieHeader,
  getAuthenticatedMemberFromCookieHeader,
  getApiBaseUrl,
  getRefreshTokenFromCookieHeader,
  setAuthenticatedMemberCookie,
  setAuthenticationCookies,
} from "@/app/login/auth-session";
import {
  applyRefreshedAuthentication,
  createSessionExpiredResponse,
  fetchApiServer,
  requestAccessTokenReissue,
  type ApiServerFetchResult,
} from "@/app/login/api-server-fetch";

function createUpstreamUnavailableResponse() {
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

async function createProxyResponse(
  result: ApiServerFetchResult,
  responseText?: string,
  authenticationResult: ApiServerFetchResult = result,
) {
  const resolvedResponseText =
    typeof responseText === "string"
      ? responseText
      : await result.upstreamResponse.text();
  const response = new NextResponse(resolvedResponseText || null, {
    status: result.upstreamResponse.status,
  });
  const contentType = result.upstreamResponse.headers.get("content-type");

  if (contentType) {
    response.headers.set("content-type", contentType);
  }

  await applyRefreshedAuthentication(response.cookies, authenticationResult);

  return response;
}

async function reissueMemberAuthentication(
  request: Request,
  response: NextResponse,
  sessionId: string | null,
  nicknameOverride?: string | null,
) {
  const cookieHeader = request.headers.get("cookie");
  const refreshToken = getRefreshTokenFromCookieHeader(
    cookieHeader,
  );

  if (!refreshToken) {
    return false;
  }

  const reissueResult = await requestAccessTokenReissue(refreshToken);

  if (reissueResult.refreshTokenRemoved || !reissueResult.refreshedTokens) {
    return false;
  }

  await setAuthenticationCookies(
    response.cookies,
    reissueResult.refreshedTokens,
    sessionId,
  );

  if (nicknameOverride) {
    const refreshedAuthentication =
      decodeAuthenticationToken(reissueResult.refreshedTokens.accessToken) ??
      getAuthenticatedMemberFromCookieHeader(cookieHeader);

    if (refreshedAuthentication) {
      setAuthenticatedMemberCookie(response.cookies, {
        ...refreshedAuthentication,
        nickname: nicknameOverride,
      });
    }
  }

  return true;
}

function getNicknameOverride(init: RequestInit) {
  if (typeof init.body !== "string") {
    return null;
  }

  try {
    const parsedBody = JSON.parse(init.body) as {
      nickname?: unknown;
    };

    if (typeof parsedBody.nickname !== "string") {
      return null;
    }

    const normalizedNickname = parsedBody.nickname.trim();

    return normalizedNickname || null;
  } catch {
    return null;
  }
}

export async function forwardMemberApiRequest(
  request: Request,
  pathname: string,
  init: RequestInit,
) {
  const upstreamUrl = new URL(pathname, getApiBaseUrl());
  let result: ApiServerFetchResult;

  try {
    result = await fetchApiServer(request, upstreamUrl, {
      ...init,
      cache: "no-store",
    });
  } catch {
    return createUpstreamUnavailableResponse();
  }

  if (result.refreshTokenRemoved) {
    return createSessionExpiredResponse(result.sessionId);
  }

  return createProxyResponse(result);
}

export async function forwardMemberProfileMutationApiRequest(
  request: Request,
  pathname: string,
  init: RequestInit,
) {
  const upstreamUrl = new URL(pathname, getApiBaseUrl());
  let result: ApiServerFetchResult;

  try {
    result = await fetchApiServer(request, upstreamUrl, {
      ...init,
      cache: "no-store",
    });
  } catch {
    return createUpstreamUnavailableResponse();
  }

  if (result.refreshTokenRemoved) {
    return createSessionExpiredResponse(result.sessionId);
  }

  const responseText = await result.upstreamResponse.text();
  const response = new NextResponse(responseText || null, {
    status: result.upstreamResponse.status,
  });
  const nicknameOverride = getNicknameOverride(init);
  const contentType = result.upstreamResponse.headers.get("content-type");

  if (contentType) {
    response.headers.set("content-type", contentType);
  }

  if (
    (result.upstreamResponse.status === 200 ||
      result.upstreamResponse.status === 201 ||
      result.upstreamResponse.status === 204) &&
    (await reissueMemberAuthentication(
      request,
      response,
      result.sessionId,
      nicknameOverride,
    ))
  ) {
    return response;
  }

  await applyRefreshedAuthentication(response.cookies, result);

  return response;
}

export async function forwardMemberDeleteApiRequest(
  request: Request,
  memberId: string,
) {
  const upstreamUrl = new URL(`/api/v1/members/${memberId}`, getApiBaseUrl());
  let result: ApiServerFetchResult;

  try {
    result = await fetchApiServer(request, upstreamUrl, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch {
    return createUpstreamUnavailableResponse();
  }

  if (result.refreshTokenRemoved) {
    return createSessionExpiredResponse(result.sessionId);
  }

  if (result.upstreamResponse.status === 204) {
    const response = new NextResponse(null, {
      status: 204,
    });
    const sessionId = getAccessTokenSessionIdFromCookieHeader(
      request.headers.get("cookie"),
    );

    await clearAuthenticationCookies(response.cookies, sessionId);

    return response;
  }

  return createProxyResponse(result);
}
