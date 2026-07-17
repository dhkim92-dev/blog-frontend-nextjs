import "server-only";
import { getApiBaseUrl } from "@/app/login/auth-session";
import { fetchCurrentServerApi } from "@/app/login/current-server-api-fetch";
import { getApiPayload, parseApiEnvelope } from "@/app/shared/api-envelope";
import type {
  PostCursorPageDto,
  PostDetailDto,
  PostListItemDto,
  PostQueryParams,
} from "./dummy-post-repositories";

type PostListPayload = {
  count: number;
  items: PostListItemDto[];
  _links: {
    next: {
      href: string;
    } | null;
  };
};

type PostDetailPayload = PostDetailDto & {
  _links?: Record<string, string> | null;
};

function isNotFoundPostDetailResponse(params: {
  httpStatus: number;
  responseBody: {
    status: number;
    code: string;
    payload: PostDetailPayload | null;
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

function extractCursor(nextHref: string | null | undefined) {
  if (!nextHref) {
    return null;
  }

  const searchParams = new URL(nextHref).searchParams;

  return searchParams.get("cursor");
}

function mapPostListPayloadToDto(payload: PostListPayload): PostCursorPageDto {
  const nextCursor = extractCursor(payload._links.next?.href);

  return {
    count: payload.count,
    items: payload.items.map((item) => ({
      id: item.id,
      status: item.status,
      title: item.title,
      content: item.content,
      writer: item.writer,
      category: item.category,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      viewCount: item.viewCount,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
    })),
    nextCursor,
  };
}

export class ApiPostRepository {
  async getPosts(params: PostQueryParams): Promise<PostCursorPageDto> {
    const url = new URL("/api/v1/posts", getApiBaseUrl());

    if (params.categoryId) {
      url.searchParams.set("categoryId", params.categoryId);
    }

    if (params.cursor) {
      url.searchParams.set("cursor", params.cursor);
    }

    const result = await fetchCurrentServerApi(url, {
      method: "GET",
      cache: "no-store",
      headers: createRequestHeaders(),
    });
    const response = result.upstreamResponse;
    const responseBody = await parseApiEnvelope<PostListPayload>(response);
    const payload = getApiPayload(responseBody);

    if (!response.ok || !payload) {
      throw new Error("Failed to fetch posts.");
    }

    return mapPostListPayloadToDto(payload);
  }

  async getPostById(postId: string): Promise<PostDetailDto | null> {
    const result = await fetchCurrentServerApi(
      new URL(`/api/v1/posts/${postId}`, getApiBaseUrl()),
      {
        method: "GET",
        cache: "no-store",
        headers: createRequestHeaders(),
      },
    );
    const response = result.upstreamResponse;
    const contentType = response.headers.get("content-type");
    const responseBody = await parseApiEnvelope<PostDetailPayload>(response);
    const payload = getApiPayload(responseBody);

    if (
      isNotFoundPostDetailResponse({
        httpStatus: response.status,
        responseBody,
      })
    ) {
      console.info("[posts/getPostById] post not found", {
        postId,
        status: response.status,
        code: responseBody?.code ?? null,
        contentType,
      });

      return null;
    }

    if (!response.ok || !payload) {
      console.error("[posts/getPostById] failed to fetch post detail", {
        postId,
        status: response.status,
        statusText: response.statusText,
        code: responseBody?.code ?? null,
        message: responseBody?.message ?? null,
        hasPayload: Boolean(payload),
        contentType,
      });

      throw new Error("Failed to fetch post detail.");
    }

    return {
      id: payload.id,
      status: payload.status,
      title: payload.title,
      content: payload.content,
      writer: payload.writer,
      category: payload.category,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      viewCount: payload.viewCount,
      likeCount: payload.likeCount,
      commentCount: payload.commentCount,
    };
  }
}

export const apiPostRepository = new ApiPostRepository();
