import {
  getApiMessage,
  getApiPayload,
  parseApiEnvelope,
  type ApiEnvelope,
} from "@/app/shared/api-envelope";
import { browserAuthFetch } from "@/app/shared/browser-auth-fetch";

export type PostCategoryDto = {
  id: string;
  name: string;
  postCount: number;
};

export type PostListItemDto = {
  id: string;
  status: string;
  title: string;
  content: null;
  writer: {
    id: string;
    nickname: string;
  };
  category: {
    id: string;
    name: string;
    postCount: number;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
};

export type PostDetailDto = Omit<PostListItemDto, "content"> & {
  content: string;
};

export type PostCursorPageDto = {
  count: number;
  items: PostListItemDto[];
  nextCursor: string | null;
};

export type PostQueryParams = {
  categoryId: string | null;
  cursor?: string | null;
};

export type SavePostRequestDto = {
  categoryId: string;
  title: string;
  content: string;
  status: string;
};

export type SavePostCategoryRequestDto = {
  name: string;
};

type CollectionPayload<TItem> = {
  count: number;
  items: TItem[];
  _links: {
    next: {
      href: string;
    } | null;
  };
};

type ApiResult = {
  status: number;
  message: string;
};

function extractCursor(nextHref: string | null | undefined) {
  if (!nextHref) {
    return null;
  }

  const searchParams = new URL(nextHref).searchParams;

  return searchParams.get("cursor");
}

function mapPostListApiResponseToDto(
  response: ApiEnvelope<CollectionPayload<PostListItemDto>>,
): PostCursorPageDto {
  return {
    count: response.payload.count,
    items: response.payload.items.map((item) => ({
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
    nextCursor: extractCursor(response.payload._links.next?.href),
  };
}

export class BrowserDummyPostRepository {
  async getPosts(params: PostQueryParams): Promise<PostCursorPageDto> {
    const searchParams = new URLSearchParams();

    if (params.categoryId) {
      searchParams.set("categoryId", params.categoryId);
    }

    if (params.cursor) {
      searchParams.set("cursor", params.cursor);
    }

    const query = searchParams.toString();
    const response = await browserAuthFetch(`/bff/api/v1/posts${query ? `?${query}` : ""}`, {
      method: "GET",
      cache: "no-store",
    });
    const responseBody =
      await parseApiEnvelope<CollectionPayload<PostListItemDto>>(response);

    if (!responseBody) {
      throw new Error("Invalid posts response.");
    }

    return mapPostListApiResponseToDto(responseBody);
  }

  async createPost(requestBody: SavePostRequestDto): Promise<number> {
    const response = await browserAuthFetch("/bff/api/v1/posts", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    return response.status;
  }

  async updatePost(
    postId: string,
    requestBody: SavePostRequestDto,
  ): Promise<number> {
    const response = await browserAuthFetch(`/bff/api/v1/posts/${postId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    return response.status;
  }

  async deletePost(postId: string): Promise<ApiResult> {
    const response = await browserAuthFetch(`/bff/api/v1/posts/${postId}`, {
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

export class BrowserDummyPostCategoryRepository {
  async getCategories(): Promise<PostCategoryDto[]> {
    const response = await browserAuthFetch("/bff/api/v1/post-categories", {
      method: "GET",
      cache: "no-store",
    });
    const responseBody =
      await parseApiEnvelope<CollectionPayload<PostCategoryDto>>(response);
    const payload = getApiPayload(responseBody);

    if (!payload) {
      throw new Error("Invalid post categories response.");
    }

    return payload.items;
  }

  async createCategory(
    requestBody: SavePostCategoryRequestDto,
  ): Promise<ApiResult> {
    const response = await browserAuthFetch("/bff/api/v1/post-categories", {
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

  async updateCategory(
    categoryId: string,
    requestBody: SavePostCategoryRequestDto,
  ): Promise<ApiResult> {
    const response = await browserAuthFetch(`/bff/api/v1/post-categories/${categoryId}`, {
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

  async deleteCategory(categoryId: string): Promise<ApiResult> {
    const response = await browserAuthFetch(`/bff/api/v1/post-categories/${categoryId}`, {
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

export const browserDummyPostRepository = new BrowserDummyPostRepository();
export const browserDummyPostCategoryRepository =
  new BrowserDummyPostCategoryRepository();
