import "server-only";
import { getBackendApiHost } from "@/app/shared/runtime-config";
import { fetchCurrentServerApi } from "@/app/login/current-server-api-fetch";
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

function createRequestHeaders() {
  return new Headers({
    Accept: "application/json",
  });
}

export class ApiPostCategoryRepository {
  async getCategories(): Promise<PostCategoryCollectionDto> {
    const result = await fetchCurrentServerApi(
      new URL("/api/v1/post-categories", getBackendApiHost()),
      {
        method: "GET",
        cache: "no-store",
        headers: createRequestHeaders(),
      },
    );
    const response = result.upstreamResponse;
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
