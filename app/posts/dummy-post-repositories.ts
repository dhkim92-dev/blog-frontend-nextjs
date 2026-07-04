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

export type PostCategoryCollectionDto = {
  count: number;
  items: PostCategoryDto[];
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

type ApiResponse<TPayload> = {
  status: number;
  payload: TPayload;
  message: string;
  code: string;
};

type CollectionPayload<TItem> = {
  count: number;
  items: TItem[];
  _links: Record<string, string> | null;
};

type PostApiItem = PostListItemDto & {
  _links: {
    next: string | null;
  };
};

type CategorySeed = {
  id: string;
  name: string;
};

type PostSeed = {
  id: string;
  title: string;
  categoryId: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
};

const PAGE_SIZE = 20;

const writer = {
  id: "df1ba2d6-a97a-45f3-b1eb-9b42487620f3",
  nickname: "dohoon",
};

const categorySeeds: CategorySeed[] = [
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce001", name: "Backend" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce002", name: "Infrastructure" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce003", name: "DevOps" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce004", name: "Database" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce005", name: "Career" },
];

const categoryPostTargets = [
  { categoryId: categorySeeds[0].id, count: 50 },
  { categoryId: categorySeeds[1].id, count: 8 },
  { categoryId: categorySeeds[2].id, count: 8 },
  { categoryId: categorySeeds[3].id, count: 7 },
  { categoryId: categorySeeds[4].id, count: 7 },
];

const postTitleTemplates: Record<string, string[]> = {
  [categorySeeds[0].id]: [
    "Designing Spring Boot modules for a growing service",
    "Applying transaction boundaries in domain services",
    "Building reliable cache invalidation with Redis",
    "Breaking down a microservice migration plan",
    "Schema change rollout without long write locks",
  ],
  [categorySeeds[1].id]: [
    "Kubernetes probes that actually catch production issues",
    "Using Terraform workspaces without hiding drift",
    "EKS deployment checklists for small teams",
    "Blue-green rollout notes for container workloads",
  ],
  [categorySeeds[2].id]: [
    "Kafka retry topics without masking real failures",
    "CI pipelines that fail fast and stay readable",
    "Jenkins pipelines for multi-environment delivery",
    "Release automation guardrails for small teams",
  ],
  [categorySeeds[3].id]: [
    "PostgreSQL indexing notes from a recent bottleneck",
    "Database connection pool tuning in a busy API",
    "Query plan review notes for mixed workloads",
    "Backup restore drills for production databases",
  ],
  [categorySeeds[4].id]: [
    "What changed in my backend interview preparation",
    "Job notes from operating services with limited headcount",
    "How I review backend incidents after release days",
    "Writing career notes without losing technical detail",
  ],
};

function createPostTitle(categoryId: string, categorySequence: number) {
  const templates = postTitleTemplates[categoryId];
  const template = templates[(categorySequence - 1) % templates.length];

  return `${template} ${categorySequence}`;
}

function createPostSeeds(): PostSeed[] {
  const remainingCounts = new Map(
    categoryPostTargets.map((target) => [target.categoryId, target.count]),
  );
  const categorySequences = new Map(
    categoryPostTargets.map((target) => [target.categoryId, 0]),
  );
  const categoryQueue: string[] = [];

  while (Array.from(remainingCounts.values()).some((count) => count > 0)) {
    for (const target of categoryPostTargets) {
      const remainingCount = remainingCounts.get(target.categoryId) ?? 0;

      if (remainingCount <= 0) {
        continue;
      }

      categoryQueue.push(target.categoryId);
      remainingCounts.set(target.categoryId, remainingCount - 1);
    }
  }

  return categoryQueue.map((categoryId, index) => {
    const categorySequence = (categorySequences.get(categoryId) ?? 0) + 1;
    const idSuffix = String(index + 1).padStart(12, "0");
    const createdAt = new Date(
      Date.UTC(2026, 5, 30, 9, 0, 0) - index * 24 * 60 * 60 * 1000,
    ).toISOString();

    categorySequences.set(categoryId, categorySequence);

    return {
      id: `cc8efcb3-14b5-4900-b7a7-${idSuffix}`,
      title: createPostTitle(categoryId, categorySequence),
      categoryId,
      createdAt,
      viewCount: 120 + index * 3,
      likeCount: 5 + (index % 17),
      commentCount: index % 9,
    };
  });
}

const postSeeds = createPostSeeds();

function getCategoryById(categoryId: string) {
  const category = categorySeeds.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }

  return category;
}

function getCategoryPostCount(categoryId: string) {
  return postSeeds.filter((post) => post.categoryId === categoryId).length;
}

export function createCategoryListApiResponse(): ApiResponse<
  CollectionPayload<PostCategoryDto>
> {
  const items = categorySeeds
    .map((category) => ({
      id: category.id,
      name: category.name,
      postCount: getCategoryPostCount(category.id),
    }))
    .sort((left, right) => right.postCount - left.postCount);

  return {
    status: 200,
    payload: {
      count: items.length,
      items,
      _links: {},
    },
    message: "success",
    code: "OK",
  };
}

function buildNextUrl(categoryId: string | null, cursor: string | null) {
  if (!cursor) {
    return null;
  }

  const params = new URLSearchParams();

  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  params.set("cursor", cursor);

  return `/api/posts?${params.toString()}`;
}

export function createPostListApiResponse(
  categoryId: string | null,
  cursor: string | null,
): ApiResponse<CollectionPayload<PostApiItem>> {
  const filteredPosts = postSeeds
    .filter((post) => !categoryId || post.categoryId === categoryId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const startIndex = cursor
    ? filteredPosts.findIndex((post) => post.id === cursor) + 1
    : 0;
  const pagedPosts = filteredPosts.slice(startIndex, startIndex + PAGE_SIZE);
  const nextCursor =
    startIndex + PAGE_SIZE < filteredPosts.length
      ? pagedPosts[pagedPosts.length - 1]?.id ?? null
      : null;

  const items = pagedPosts.map((post) => {
    const category = getCategoryById(post.categoryId);

    return {
      id: post.id,
      status: "PUBLISHED",
      title: post.title,
      content: null,
      writer,
      category: {
        id: category.id,
        name: category.name,
        postCount: 0,
      },
      createdAt: post.createdAt,
      updatedAt: post.createdAt,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      _links: {
        next: buildNextUrl(categoryId, nextCursor),
      },
    };
  });

  return {
    status: 200,
    payload: {
      count: filteredPosts.length,
      items,
      _links: null,
    },
    message: "success",
    code: "OK",
  };
}

function extractCursor(nextUrl: string | null) {
  if (!nextUrl) {
    return null;
  }

  const searchParams = new URL(nextUrl, "https://dummy.local").searchParams;

  return searchParams.get("cursor");
}

export class DummyPostCategoryRepository {
  async getCategories(): Promise<PostCategoryCollectionDto> {
    const response = createCategoryListApiResponse();

    return {
      count: response.payload.count,
      items: response.payload.items,
    };
  }
}

export class DummyPostRepository {
  async getPosts(params: PostQueryParams): Promise<PostCursorPageDto> {
    const response = createPostListApiResponse(
      params.categoryId,
      params.cursor ?? null,
    );

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
      nextCursor:
        response.payload.items.length > 0
          ? extractCursor(
              response.payload.items[response.payload.items.length - 1]._links.next,
            )
          : null,
    };
  }
}

function mapPostListApiResponseToDto(
  response: ApiResponse<CollectionPayload<PostApiItem>>,
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
    nextCursor:
      response.payload.items.length > 0
        ? extractCursor(
            response.payload.items[response.payload.items.length - 1]._links.next,
          )
        : null,
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
    const response = await fetch(`/api/posts${query ? `?${query}` : ""}`, {
      method: "GET",
      cache: "no-store",
    });
    const responseBody =
      (await response.json()) as ApiResponse<CollectionPayload<PostApiItem>>;

    return mapPostListApiResponseToDto(responseBody);
  }
}

export const dummyPostCategoryRepository = new DummyPostCategoryRepository();
export const dummyPostRepository = new DummyPostRepository();
export const browserDummyPostRepository = new BrowserDummyPostRepository();
