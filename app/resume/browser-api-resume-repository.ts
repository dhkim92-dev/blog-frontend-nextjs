import { getApiMessage, parseApiEnvelope } from "@/app/shared/api-envelope";
import { browserAuthFetch } from "@/app/shared/browser-auth-fetch";
import type { SaveResumeRequestDto } from "./resume-types";

type ApiResult = {
  status: number;
  message: string;
};

export class BrowserApiResumeRepository {
  async createResume(requestBody: SaveResumeRequestDto): Promise<ApiResult> {
    const response = await browserAuthFetch("/bff/api/v1/resumes", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "MARKDOWN",
        content: requestBody.content,
      }),
    });
    const responseBody = await parseApiEnvelope<null>(response);

    return {
      status: response.status,
      message: getApiMessage(responseBody),
    };
  }

  async updateResume(
    resumeId: string,
    requestBody: SaveResumeRequestDto,
  ): Promise<ApiResult> {
    const response = await browserAuthFetch(`/bff/api/v1/resumes/${resumeId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "MARKDOWN",
        content: requestBody.content,
      }),
    });
    const responseBody = await parseApiEnvelope<null>(response);

    return {
      status: response.status,
      message: getApiMessage(responseBody),
    };
  }

  async deleteResume(resumeId: string): Promise<ApiResult> {
    const response = await browserAuthFetch(`/bff/api/v1/resumes/${resumeId}`, {
      method: "DELETE",
      cache: "no-store",
    });
    const responseBody = await parseApiEnvelope<null>(response);

    return {
      status: response.status,
      message: getApiMessage(responseBody),
    };
  }
}

export const browserApiResumeRepository = new BrowserApiResumeRepository();
