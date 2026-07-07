import "server-only";
import { cookies } from "next/headers";
import { accessTokenSessionStore } from "@/app/login/access-token-session-store";
import {
  getAccessTokenSessionIdFromCookieHeader,
  getApiBaseUrl,
} from "@/app/login/auth-session";
import { getApiPayload, parseApiEnvelope } from "@/app/shared/api-envelope";
import type { ResumeDetailDto } from "./resume-types";

type ResumePayload = {
  id: string;
  type?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

function isNotFoundResumeResponse(params: {
  httpStatus: number;
  responseBody: {
    status: number;
    code: string;
    payload: ResumePayload | null;
  } | null;
}) {
  const { httpStatus, responseBody } = params;

  if (httpStatus === 404) {
    return true;
  }

  if (!responseBody) {
    return false;
  }

  return (
    responseBody.status === 404 ||
    responseBody.code.endsWith("_NOT_FOUND") ||
    responseBody.payload === null
  );
}

function createRequestHeaders(accessToken: string | null) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export class ApiResumeRepository {
  async getResume(): Promise<ResumeDetailDto | null> {
    const cookieHeader = (await cookies()).toString();
    const sessionId = getAccessTokenSessionIdFromCookieHeader(cookieHeader);
    const accessToken = sessionId
      ? (await accessTokenSessionStore.get(sessionId))?.accessToken ?? null
      : null;
    let response: Response;

    try {
      response = await fetch(new URL("/api/v1/resumes", getApiBaseUrl()), {
        method: "GET",
        cache: "no-store",
        headers: createRequestHeaders(accessToken),
      });
    } catch (error) {
      console.error("[resume/getResume] failed to fetch resume", {
        apiBaseUrl: getApiBaseUrl(),
        error,
      });

      return null;
    }

    const responseBody = await parseApiEnvelope<ResumePayload>(response);
    const payload = getApiPayload(responseBody);

    if (
      isNotFoundResumeResponse({
        httpStatus: response.status,
        responseBody,
      })
    ) {
      return null;
    }

    if (!response.ok || !payload) {
      throw new Error("Failed to fetch resume.");
    }

    return {
      id: payload.id,
      content: payload.content,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      deletedAt: payload.deletedAt ?? null,
    };
  }
}

export const apiResumeRepository = new ApiResumeRepository();
