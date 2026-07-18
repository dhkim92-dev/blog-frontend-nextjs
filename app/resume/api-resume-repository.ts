import "server-only";
import { getBackendApiHost } from "@/app/shared/runtime-config";
import { getApiPayload, parseApiEnvelope } from "@/app/shared/api-envelope";
import { RESUME_CACHE_TAG } from "./resume-cache";
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
      response = await fetch(
        new URL("/api/v1/resumes", getBackendApiHost()),
        {
          method: "GET",
          headers: createRequestHeaders(),
          next: {
            revalidate: 3600,
            tags: [RESUME_CACHE_TAG],
          },
        },
      );
    } catch (error) {
      console.error("[resume/getResume] failed to fetch resume", {
        apiBaseUrl: getBackendApiHost(),
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
