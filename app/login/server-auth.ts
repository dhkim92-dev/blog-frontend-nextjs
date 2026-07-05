import "server-only";
import { cookies } from "next/headers";
import { accessTokenSessionStore } from "@/app/login/access-token-session-store";
import {
  decodeAuthenticationJwtClaims,
  getAccessTokenSessionIdFromCookieHeader,
  parseAuthenticatedMemberCookie,
  type AuthenticationJwtClaims,
} from "@/app/login/auth-session";

export type ServerAuthentication =
  | {
      isAuthenticated: false;
      accessTokenSessionId: null;
      claims: null;
    }
  | {
      isAuthenticated: true;
      accessTokenSessionId: string | null;
      claims: AuthenticationJwtClaims;
    };

function toAuthenticationClaims(
  payload: ReturnType<typeof parseAuthenticatedMemberCookie>,
): AuthenticationJwtClaims | null {
  if (!payload) {
    return null;
  }

  return {
    sub: payload.sub,
    memberId: payload.memberId ?? null,
    nickname: payload.nickname ?? null,
    roles: payload.roles,
  };
}

export async function getCurrentServerAuthentication(): Promise<ServerAuthentication> {
  const cookieStore = await cookies();
  const authenticatedMember = parseAuthenticatedMemberCookie(
    cookieStore.get("authenticated-member")?.value,
  );
  const authenticatedMemberClaims = toAuthenticationClaims(authenticatedMember);
  const accessTokenSessionId = getAccessTokenSessionIdFromCookieHeader(
    cookieStore.toString(),
  );

  if (!accessTokenSessionId) {
    if (authenticatedMemberClaims) {
      return {
        isAuthenticated: true,
        accessTokenSessionId: null,
        claims: authenticatedMemberClaims,
      };
    }

    return {
      isAuthenticated: false,
      accessTokenSessionId: null,
      claims: null,
    };
  }

  const session = await accessTokenSessionStore.get(accessTokenSessionId);

  if (!session) {
    if (authenticatedMemberClaims) {
      return {
        isAuthenticated: true,
        accessTokenSessionId: null,
        claims: authenticatedMemberClaims,
      };
    }

    return {
      isAuthenticated: false,
      accessTokenSessionId: null,
      claims: null,
    };
  }

  const claims = decodeAuthenticationJwtClaims(session.accessToken);

  if (!claims) {
    if (authenticatedMemberClaims) {
      return {
        isAuthenticated: true,
        accessTokenSessionId: null,
        claims: authenticatedMemberClaims,
      };
    }

    return {
      isAuthenticated: false,
      accessTokenSessionId: null,
      claims: null,
    };
  }

  return {
    isAuthenticated: true,
    accessTokenSessionId,
    claims,
  };
}
