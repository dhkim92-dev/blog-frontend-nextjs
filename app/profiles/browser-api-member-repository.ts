import {
  getApiMessage,
  parseApiEnvelope,
} from "@/app/shared/api-envelope";
import { browserAuthFetch } from "@/app/shared/browser-auth-fetch";
import type { SaveMemberProfileRequestDto } from "./profile-types";

type ApiResult = {
  status: number;
  message: string;
};

export class BrowserApiMemberRepository {
  async createMember(requestBody: SaveMemberProfileRequestDto): Promise<ApiResult> {
    const response = await browserAuthFetch("/bff/api/members", {
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

  async updateMember(
    memberId: string,
    requestBody: SaveMemberProfileRequestDto,
  ): Promise<ApiResult> {
    const response = await browserAuthFetch(`/bff/api/members/${memberId}`, {
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

  async deleteMember(memberId: string): Promise<ApiResult> {
    const response = await browserAuthFetch(`/bff/api/members/${memberId}`, {
      method: "DELETE",
      cache: "no-store",
    });
    const responseBody = await parseApiEnvelope<null>(response);

    return {
      status: response.status,
      message: getApiMessage(responseBody),
    };
  }

  async logout(): Promise<ApiResult> {
    const response = await browserAuthFetch("/bff/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    });
    const responseBody = await parseApiEnvelope<null>(response);

    return {
      status: response.status,
      message: getApiMessage(responseBody),
    };
  }
}

export const browserApiMemberRepository = new BrowserApiMemberRepository();
