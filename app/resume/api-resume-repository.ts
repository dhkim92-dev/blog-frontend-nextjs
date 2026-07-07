import "server-only";
import { getApiBaseUrl } from "@/app/login/auth-session";
import { fetchCurrentServerApi } from "@/app/login/current-server-api-fetch";
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

function createRequestHeaders() {
  return new Headers({
    Accept: "application/json",
  });
}

export class ApiResumeRepository {
  async getResume(): Promise<ResumeDetailDto | null> {
    let response: Response;

    try {
      const result = await fetchCurrentServerApi(
        new URL("/api/v1/resumes", getApiBaseUrl()),
        {
          method: "GET",
          cache: "no-store",
          headers: createRequestHeaders(),
        },
      );

      response = result.upstreamResponse;
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
