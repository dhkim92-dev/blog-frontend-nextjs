import "server-only";
import { getBackendApiHost } from "@/app/shared/runtime-config";
import { fetchCurrentServerApi } from "@/app/login/current-server-api-fetch";
import { getApiPayload, parseApiEnvelope } from "@/app/shared/api-envelope";
import type {
  MemberAuthAccountDto,
  MemberProfileDto,
} from "./profile-types";

type MemberAuthAccountPayload = {
  email: {
    address: string;
    createdAt: string;
    verified: boolean;
  } | null;
  oauth2?: {
    provider: string;
    userId: string;
    createdAt?: string;
  } | null;
  oauth?: {
    provider: string;
    userId: string;
    createdAt?: string;
  } | null;
};

export class MemberAuthenticationExpiredError extends Error {
  constructor() {
    super("Member authentication expired.");
  }
}

function createRequestHeaders() {
  return new Headers({
    Accept: "application/json",
  });
}

function isNotFoundResponse(params: {
  httpStatus: number;
  responseBody: {
    status: number;
    code: string;
    payload: unknown;
  } | null;
}) {
  const { httpStatus, responseBody } = params;

  if (httpStatus === 404) {
    return true;
  }

  if (!responseBody) {
    return false;
  }

  return responseBody.status === 404 || responseBody.code.endsWith("_NOT_FOUND");
}

function isUnauthorizedResponse(params: {
  httpStatus: number;
  responseBody: {
    status: number;
    code: string;
    payload: unknown;
  } | null;
}) {
  const { httpStatus, responseBody } = params;

  if (httpStatus === 401 || httpStatus === 403) {
    return true;
  }

  if (!responseBody) {
    return false;
  }

  return responseBody.status === 401 || responseBody.status === 403;
}

export class ApiMemberRepository {
  async getMemberById(memberId: string): Promise<MemberProfileDto | null> {
    const result = await fetchCurrentServerApi(
      new URL(`/api/v1/members/${memberId}`, getBackendApiHost()),
      {
        method: "GET",
        cache: "no-store",
        headers: createRequestHeaders(),
      },
    );
    const response = result.upstreamResponse;
    const responseBody = await parseApiEnvelope<MemberProfileDto | null>(response);
    const payload = getApiPayload(responseBody);

    if (
      isNotFoundResponse({
        httpStatus: response.status,
        responseBody,
      })
    ) {
      return null;
    }

    if (
      isUnauthorizedResponse({
        httpStatus: response.status,
        responseBody,
      })
    ) {
      throw new MemberAuthenticationExpiredError();
    }

    if (!response.ok || !payload) {
      throw new Error("Failed to fetch member profile.");
    }

    return payload;
  }

  async getAuthAccountById(
    authAccountId: string,
  ): Promise<MemberAuthAccountDto | null> {
    const result = await fetchCurrentServerApi(
      new URL(`/api/v1/auth/${authAccountId}`, getBackendApiHost()),
      {
        method: "GET",
        cache: "no-store",
        headers: createRequestHeaders(),
      },
    );
    const response = result.upstreamResponse;
    const responseBody = await parseApiEnvelope<MemberAuthAccountPayload | null>(
      response,
    );
    const payload = getApiPayload(responseBody);

    if (
      isNotFoundResponse({
        httpStatus: response.status,
        responseBody,
      })
    ) {
      return null;
    }

    if (
      isUnauthorizedResponse({
        httpStatus: response.status,
        responseBody,
      })
    ) {
      throw new MemberAuthenticationExpiredError();
    }

    if (!response.ok || !payload) {
      throw new Error("Failed to fetch auth account.");
    }

    return {
      email: payload.email,
      oauth: payload.oauth2 ?? payload.oauth ?? null,
    };
  }
}

export const apiMemberRepository = new ApiMemberRepository();
