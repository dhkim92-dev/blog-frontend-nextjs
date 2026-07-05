import type { SaveResumeRequestDto } from "./resume-types";

type ApiResponse<TPayload> = {
  status: number;
  payload: TPayload;
  message: string;
  code: string;
};

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
    const responseBody = (await response.json()) as ApiResponse<null>;

    return {
      status: response.status,
      message: responseBody.message,
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
    const responseBody = (await response.json()) as ApiResponse<null>;

    return {
      status: response.status,
      message: responseBody.message,
    };
  }

  async deleteResume(): Promise<ApiResult> {
    const response = await fetch("/api/resume", {
      method: "DELETE",
      cache: "no-store",
    });
    const responseBody = (await response.json()) as ApiResponse<null>;

    return {
      status: response.status,
      message: responseBody.message,
    };
  }
}

export const browserDummyResumeRepository = new BrowserDummyResumeRepository();
