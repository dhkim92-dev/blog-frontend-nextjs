import { NextResponse } from "next/server";
import {
  buildLoginErrorRedirectUrl,
  getRefreshTokenFromCookieHeader,
  setAuthenticationCookies,
} from "@/app/login/auth-session";
import { requestAccessTokenReissue } from "@/app/login/api-server-fetch";

function maskTokenForLog(token: string | null) {
  if (!token) {
    return null;
  }

  if (token.length <= 8) {
    return `${"*".repeat(token.length)}(len=${token.length})`;
  }

  return `${token.slice(0, 4)}...${token.slice(-4)}(len=${token.length})`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const provider = requestUrl.searchParams.get("provider");
  const hasError = requestUrl.searchParams.get("error");

  console.info("[auth/oauth-callback] callback received", {
    url: requestUrl.toString(),
    provider,
    hasError: Boolean(hasError),
  });

  if (hasError) {
    console.warn("[auth/oauth-callback] upstream callback error", {
      provider,
      error: hasError,
    });

    return NextResponse.redirect(
      buildLoginErrorRedirectUrl(requestUrl.origin, "oauth_failed", provider),
    );
  }

  const refreshToken = getRefreshTokenFromCookieHeader(
    request.headers.get("cookie"),
  );

  console.info("[auth/oauth-callback] refresh token parsed from cookie", {
    provider,
    hasRefreshToken: Boolean(refreshToken),
    refreshToken: maskTokenForLog(refreshToken),
  });

  if (!refreshToken) {
    return NextResponse.redirect(
      buildLoginErrorRedirectUrl(
        requestUrl.origin,
        "oauth_refresh_token_missing",
        provider,
      ),
    );
  }

  let reissueResult: Awaited<ReturnType<typeof requestAccessTokenReissue>>;

  try {
    reissueResult = await requestAccessTokenReissue(refreshToken);
  } catch {
    console.error("[auth/oauth-callback] access token reissue request failed", {
      provider,
      refreshToken: maskTokenForLog(refreshToken),
    });

    return NextResponse.redirect(
      buildLoginErrorRedirectUrl(
        requestUrl.origin,
        "oauth_reissue_failed",
        provider,
      ),
    );
  }

  if (reissueResult.refreshTokenRemoved || !reissueResult.refreshedTokens) {
    console.warn("[auth/oauth-callback] access token reissue failed", {
      provider,
      refreshTokenRemoved: reissueResult.refreshTokenRemoved,
      hasRefreshedTokens: Boolean(reissueResult.refreshedTokens),
    });

    return NextResponse.redirect(
      buildLoginErrorRedirectUrl(
        requestUrl.origin,
        "oauth_reissue_failed",
        provider,
      ),
    );
  }

  const response = NextResponse.redirect(new URL("/", requestUrl.origin));

  await setAuthenticationCookies(response.cookies, reissueResult.refreshedTokens);

  console.info("[auth/oauth-callback] authentication established", {
    provider,
    redirectTo: new URL("/", requestUrl.origin).toString(),
    accessToken: maskTokenForLog(reissueResult.refreshedTokens.accessToken),
  });

  return response;
}
