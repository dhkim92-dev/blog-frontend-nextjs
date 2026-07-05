import "server-only";
import { cookies } from "next/headers";
import { accessTokenSessionStore } from "@/app/login/access-token-session-store";
import {
  getAccessTokenSessionIdFromCookieHeader,
  getApiBaseUrl,
} from "@/app/login/auth-session";
import { getApiPayload, parseApiEnvelope } from "@/app/shared/api-envelope";
import type {
  PostCategoryCollectionDto,
  PostCategoryDto,
} from "./dummy-post-repositories";

type PostCategoryListPayload = {
  items: PostCategoryDto[];
  count: number;
  _link: {
    next: string | null;
  } | null;
};

function createRequestHeaders(accessToken: string | null) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export class ApiPostCategoryRepository {
  async getCategories(): Promise<PostCategoryCollectionDto> {
    const cookieHeader = (await cookies()).toString();
    const sessionId = getAccessTokenSessionIdFromCookieHeader(cookieHeader);
    const accessToken = sessionId
      ? (await accessTokenSessionStore.get(sessionId))?.accessToken ?? null
      : null;
    const response = await fetch(
      new URL("/api/v1/post-categories", getApiBaseUrl()),
      {
        method: "GET",
        cache: "no-store",
        headers: createRequestHeaders(accessToken),
      },
    );
    const responseBody =
      await parseApiEnvelope<PostCategoryListPayload>(response);
    const payload = getApiPayload(responseBody);

    if (!response.ok || !payload) {
      throw new Error("Failed to fetch post categories.");
    }

    return {
      count: payload.count,
      items: payload.items,
    };
  }
}

export const apiPostCategoryRepository = new ApiPostCategoryRepository();
