import {
  getApiMessage,
  parseApiEnvelope,
} from "@/app/shared/api-envelope";
import type { SaveResumeRequestDto } from "./resume-types";

type ApiResult = {
  status: number;
  message: string;
};

export class BrowserDummyResumeRepository {
  async createResume(requestBody: SaveResumeRequestDto): Promise<ApiResult> {
    const response = await fetch("/api/resume", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const responseBody = await parseApiEnvelope<null>(response);

    return {
      status: response.status,
      message: getApiMessage(responseBody),
    };
  }

  async updateResume(requestBody: SaveResumeRequestDto): Promise<ApiResult> {
    const response = await fetch("/api/resume", {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const responseBody = await parseApiEnvelope<null>(response);

    return {
      status: response.status,
      message: getApiMessage(responseBody),
    };
  }

  async deleteResume(): Promise<ApiResult> {
    const response = await fetch("/api/resume", {
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

export const browserDummyResumeRepository = new BrowserDummyResumeRepository();
