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

export type SavePostRequestDto = {
  categoryId: string;
  title: string;
  content: string;
  status: string;
};

export type SavePostCategoryRequestDto = {
  name: string;
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

type PostDetailApiItem = PostDetailDto & {
  _links: Record<string, string> | null;
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
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  content: string;
};

const PAGE_SIZE = 20;

const writer = {
  id: "df1ba2d6-a97a-45f3-b1eb-9b42487620f3",
  nickname: "dohoon",
};

const initialCategorySeeds: CategorySeed[] = [
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce001", name: "Backend" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce002", name: "Infrastructure" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce003", name: "DevOps" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce004", name: "Database" },
  { id: "7ff1532d-7d25-4c7b-a182-f65dd0cce005", name: "Career" },
];

const categoryPostTargets = [
  { categoryId: initialCategorySeeds[0].id, count: 50 },
  { categoryId: initialCategorySeeds[1].id, count: 8 },
  { categoryId: initialCategorySeeds[2].id, count: 8 },
  { categoryId: initialCategorySeeds[3].id, count: 7 },
  { categoryId: initialCategorySeeds[4].id, count: 7 },
];

const postTitleTemplates: Record<string, string[]> = {
  [initialCategorySeeds[0].id]: [
    "Designing Spring Boot modules for a growing service",
    "Applying transaction boundaries in domain services",
    "Building reliable cache invalidation with Redis",
    "Breaking down a microservice migration plan",
    "Schema change rollout without long write locks",
  ],
  [initialCategorySeeds[1].id]: [
    "Kubernetes probes that actually catch production issues",
    "Using Terraform workspaces without hiding drift",
    "EKS deployment checklists for small teams",
    "Blue-green rollout notes for container workloads",
  ],
  [initialCategorySeeds[2].id]: [
    "Kafka retry topics without masking real failures",
    "CI pipelines that fail fast and stay readable",
    "Jenkins pipelines for multi-environment delivery",
    "Release automation guardrails for small teams",
  ],
  [initialCategorySeeds[3].id]: [
    "PostgreSQL indexing notes from a recent bottleneck",
    "Database connection pool tuning in a busy API",
    "Query plan review notes for mixed workloads",
    "Backup restore drills for production databases",
  ],
  [initialCategorySeeds[4].id]: [
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

function getInitialCategoryById(categoryId: string) {
  const category = initialCategorySeeds.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }

  return category;
}

function createPostContent(params: {
  title: string;
  categoryName: string;
  categorySequence: number;
}) {
  const { title, categoryName, categorySequence } = params;

  return `# ${title}

## Summary

이 글은 **${categoryName}** 카테고리의 ${categorySequence}번째 샘플 게시물입니다.
실제 상세 보기 페이지에서 필요한 마크다운, 코드 블럭, 수식, 이미지, 유튜브 렌더링을 함께 검증하기 위한 더미 본문입니다.

## Checklist

- 핵심 맥락을 빠르게 읽을 수 있어야 합니다.
- 코드 블럭은 언어별 syntax highlighting 이 되어야 합니다.
- 수식과 이미지, 외부 임베드도 같은 본문 안에서 자연스럽게 보여야 합니다.

## Kotlin Example

\`\`\`kotlin
data class PublishPostCommand(
    val title: String,
    val categoryId: String,
    val content: String,
)

fun validate(command: PublishPostCommand) {
    require(command.title.isNotBlank()) { "title must not be blank" }
    require(command.content.length >= 20) { "content is too short" }
}
\`\`\`

## TypeScript Example

\`\`\`typescript
type PostSummary = {
  id: string;
  title: string;
  createdAt: string;
};

export function sortPosts(posts: PostSummary[]) {
  return [...posts].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}
\`\`\`

## Bash Example

\`\`\`bash
curl -X GET "https://api.example.com/posts/${categorySequence}" \\
  -H "Accept: application/json"
\`\`\`

## JSON Example

\`\`\`json
{
  "title": "${title}",
  "category": "${categoryName}",
  "sequence": ${categorySequence}
}
\`\`\`

## Formula

인프라 여유율을 단순화하면 다음과 같이 볼 수 있습니다.

$$
capacity\\ margin = \\frac{max\\ throughput - current\\ throughput}{max\\ throughput}
$$

인라인 수식도 표시되어야 합니다. 예를 들어 $p95 < 250ms$ 를 목표로 둘 수 있습니다.

## Image

![profile image](/dohoon-kim.png){width=320}

<p align="center">이 문장은 HTML align 속성을 이용한 중앙 정렬 예시입니다.</p>

## YouTube

<iframe
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  title="YouTube video player"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>

## Closing Notes

> 렌더러가 HTML 과 Markdown 을 모두 다루더라도, 허용 범위는 명확하게 제한하는 편이 안전합니다.

다음 단계에서는 실제 API 연동과 작성자 권한 기반 수정/삭제 노출 조건을 연결하면 됩니다.
`;
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
    const category = getInitialCategoryById(categoryId);
    const categorySequence = (categorySequences.get(categoryId) ?? 0) + 1;
    const idSuffix = String(index + 1).padStart(12, "0");
    const createdAt = new Date(
      Date.UTC(2026, 5, 30, 9, 0, 0) - index * 24 * 60 * 60 * 1000,
    ).toISOString();
    const updatedAt = new Date(
      Date.UTC(2026, 5, 30, 12, 30, 0) - index * 24 * 60 * 60 * 1000,
    ).toISOString();
    const title = createPostTitle(categoryId, categorySequence);

    categorySequences.set(categoryId, categorySequence);

    return {
      id: `cc8efcb3-14b5-4900-b7a7-${idSuffix}`,
      title,
      categoryId,
      createdAt,
      updatedAt,
      viewCount: 120 + index * 3,
      likeCount: 5 + (index % 17),
      commentCount: index % 9,
      content: createPostContent({
        title,
        categoryName: category.name,
        categorySequence,
      }),
    };
  });
}

const initialPostSeeds = createPostSeeds();

async function readCategorySeeds() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const storeDirectory = path.join("/private/tmp", "blog-nextjs-dummy-post-store");
  const storeFilePath = path.join(storeDirectory, "categories.json");

  try {
    const storedValue = await fs.readFile(storeFilePath, "utf8");
    const parsedValue = JSON.parse(storedValue) as CategorySeed[];

    return Array.isArray(parsedValue) ? parsedValue : [...initialCategorySeeds];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await fs.mkdir(storeDirectory, { recursive: true });
    await fs.writeFile(
      storeFilePath,
      JSON.stringify(initialCategorySeeds, null, 2),
      "utf8",
    );

    return [...initialCategorySeeds];
  }
}

async function writeCategorySeeds(categorySeeds: CategorySeed[]) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const storeDirectory = path.join("/private/tmp", "blog-nextjs-dummy-post-store");
  const storeFilePath = path.join(storeDirectory, "categories.json");

  await fs.mkdir(storeDirectory, { recursive: true });
  await fs.writeFile(
    storeFilePath,
    JSON.stringify(categorySeeds, null, 2),
    "utf8",
  );
}

async function readPostSeeds() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const storeDirectory = path.join("/private/tmp", "blog-nextjs-dummy-post-store");
  const storeFilePath = path.join(storeDirectory, "posts.json");

  try {
    const storedValue = await fs.readFile(storeFilePath, "utf8");
    const parsedValue = JSON.parse(storedValue) as PostSeed[];

    return Array.isArray(parsedValue) ? parsedValue : [...initialPostSeeds];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await fs.mkdir(storeDirectory, { recursive: true });
    await fs.writeFile(
      storeFilePath,
      JSON.stringify(initialPostSeeds, null, 2),
      "utf8",
    );

    return [...initialPostSeeds];
  }
}

async function writePostSeeds(postSeeds: PostSeed[]) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const storeDirectory = path.join("/private/tmp", "blog-nextjs-dummy-post-store");
  const storeFilePath = path.join(storeDirectory, "posts.json");

  await fs.mkdir(storeDirectory, { recursive: true });
  await fs.writeFile(storeFilePath, JSON.stringify(postSeeds, null, 2), "utf8");
}

async function getCategoryPostCount(categoryId: string) {
  const postSeeds = await readPostSeeds();

  return postSeeds.filter((post) => post.categoryId === categoryId).length;
}

function getStoredCategoryById(categories: CategorySeed[], categoryId: string) {
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }

  return category;
}

function normalizeCategoryName(name: string) {
  return name.trim();
}

export async function createCategoryListApiResponse(): Promise<
  ApiResponse<CollectionPayload<PostCategoryDto>>
> {
  const categorySeeds = await readCategorySeeds();
  const items = await Promise.all(
    categorySeeds.map(async (category) => ({
      id: category.id,
      name: category.name,
      postCount: await getCategoryPostCount(category.id),
    })),
  );

  return {
    status: 200,
    payload: {
      count: items.length,
      items: items.sort((left, right) => right.postCount - left.postCount),
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

  return `/api/v1/posts?${params.toString()}`;
}

export async function createPostListApiResponse(
  categoryId: string | null,
  cursor: string | null,
): Promise<ApiResponse<CollectionPayload<PostApiItem>>> {
  const [postSeeds, categorySeeds] = await Promise.all([
    readPostSeeds(),
    readCategorySeeds(),
  ]);
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
    const category = getStoredCategoryById(categorySeeds, post.categoryId);

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
      updatedAt: post.updatedAt,
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

export async function createPostDetailApiResponse(
  postId: string,
): Promise<ApiResponse<PostDetailApiItem> | null> {
  const [postSeeds, categorySeeds] = await Promise.all([
    readPostSeeds(),
    readCategorySeeds(),
  ]);
  const post = postSeeds.find((item) => item.id === postId);

  if (!post) {
    return null;
  }

  const category = getStoredCategoryById(categorySeeds, post.categoryId);

  return {
    status: 200,
    payload: {
      id: post.id,
      status: "PUBLISHED",
      title: post.title,
      content: post.content,
      writer,
      category: {
        id: category.id,
        name: category.name,
        postCount: 0,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      _links: {},
    },
    message: "success",
    code: "OK",
  };
}

export async function createPostApiResponse(
  requestBody: SavePostRequestDto,
): Promise<ApiResponse<null>> {
  const [postSeeds, categorySeeds] = await Promise.all([
    readPostSeeds(),
    readCategorySeeds(),
  ]);
  getStoredCategoryById(categorySeeds, requestBody.categoryId);

  const now = new Date().toISOString();

  postSeeds.unshift({
    id: crypto.randomUUID(),
    title: requestBody.title,
    categoryId: requestBody.categoryId,
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    content: requestBody.content,
  });

  await writePostSeeds(postSeeds);

  return {
    status: 201,
    payload: null,
    message: "post created",
    code: "POST_CREATED",
  };
}

export async function updatePostApiResponse(
  postId: string,
  requestBody: SavePostRequestDto,
): Promise<ApiResponse<null> | null> {
  const [postSeeds, categorySeeds] = await Promise.all([
    readPostSeeds(),
    readCategorySeeds(),
  ]);
  const post = postSeeds.find((item) => item.id === postId);

  if (!post) {
    return null;
  }

  getStoredCategoryById(categorySeeds, requestBody.categoryId);

  post.title = requestBody.title;
  post.categoryId = requestBody.categoryId;
  post.content = requestBody.content;
  post.updatedAt = new Date().toISOString();

  await writePostSeeds(postSeeds);

  return {
    status: 200,
    payload: null,
    message: "post updated",
    code: "POST_UPDATED",
  };
}

export async function deletePostApiResponse(
  postId: string,
): Promise<ApiResponse<null> | null> {
  const postSeeds = await readPostSeeds();
  const postIndex = postSeeds.findIndex((item) => item.id === postId);

  if (postIndex < 0) {
    return null;
  }

  postSeeds.splice(postIndex, 1);
  await writePostSeeds(postSeeds);

  return {
    status: 200,
    payload: null,
    message: "post deleted",
    code: "POST_DELETED",
  };
}

export async function createPostCategoryApiResponse(
  requestBody: SavePostCategoryRequestDto,
): Promise<ApiResponse<null>> {
  const categorySeeds = await readCategorySeeds();
  const normalizedName = normalizeCategoryName(requestBody.name);

  if (!normalizedName || normalizedName.length > 20) {
    return {
      status: 400,
      payload: null,
      message: "category name must be between 1 and 20 characters",
      code: "INVALID_CATEGORY_NAME",
    };
  }

  if (
    categorySeeds.some(
      (category) => category.name.toLowerCase() === normalizedName.toLowerCase(),
    )
  ) {
    return {
      status: 409,
      payload: null,
      message: "category name already exists",
      code: "CATEGORY_NAME_CONFLICT",
    };
  }

  categorySeeds.push({
    id: crypto.randomUUID(),
    name: normalizedName,
  });

  await writeCategorySeeds(categorySeeds);

  return {
    status: 201,
    payload: null,
    message: "category created",
    code: "CATEGORY_CREATED",
  };
}

export async function updatePostCategoryApiResponse(
  categoryId: string,
  requestBody: SavePostCategoryRequestDto,
): Promise<ApiResponse<null> | null> {
  const categorySeeds = await readCategorySeeds();
  const category = categorySeeds.find((item) => item.id === categoryId);

  if (!category) {
    return null;
  }

  const normalizedName = normalizeCategoryName(requestBody.name);

  if (!normalizedName || normalizedName.length > 20) {
    return {
      status: 400,
      payload: null,
      message: "category name must be between 1 and 20 characters",
      code: "INVALID_CATEGORY_NAME",
    };
  }

  if (
    categorySeeds.some(
      (item) =>
        item.id !== categoryId &&
        item.name.toLowerCase() === normalizedName.toLowerCase(),
    )
  ) {
    return {
      status: 409,
      payload: null,
      message: "category name already exists",
      code: "CATEGORY_NAME_CONFLICT",
    };
  }

  category.name = normalizedName;

  await writeCategorySeeds(categorySeeds);

  return {
    status: 200,
    payload: null,
    message: "category updated",
    code: "CATEGORY_UPDATED",
  };
}

export async function deletePostCategoryApiResponse(
  categoryId: string,
): Promise<ApiResponse<null> | null> {
  const [categorySeeds, postSeeds] = await Promise.all([
    readCategorySeeds(),
    readPostSeeds(),
  ]);
  const categoryIndex = categorySeeds.findIndex((item) => item.id === categoryId);

  if (categoryIndex < 0) {
    return null;
  }

  const postCount = postSeeds.filter((post) => post.categoryId === categoryId).length;

  if (postCount > 0) {
    return {
      status: 409,
      payload: null,
      message: "cannot delete category with posts",
      code: "CATEGORY_HAS_POSTS",
    };
  }

  categorySeeds.splice(categoryIndex, 1);
  await writeCategorySeeds(categorySeeds);

  return {
    status: 200,
    payload: null,
    message: "category deleted",
    code: "CATEGORY_DELETED",
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
    const response = await createCategoryListApiResponse();

    return {
      count: response.payload.count,
      items: response.payload.items,
    };
  }
}

export class DummyPostRepository {
  async getPosts(params: PostQueryParams): Promise<PostCursorPageDto> {
    const response = await createPostListApiResponse(
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

  async getPostById(postId: string): Promise<PostDetailDto | null> {
    const response = await createPostDetailApiResponse(postId);

    if (!response) {
      return null;
    }

    return {
      id: response.payload.id,
      status: response.payload.status,
      title: response.payload.title,
      content: response.payload.content,
      writer: response.payload.writer,
      category: response.payload.category,
      createdAt: response.payload.createdAt,
      updatedAt: response.payload.updatedAt,
      viewCount: response.payload.viewCount,
      likeCount: response.payload.likeCount,
      commentCount: response.payload.commentCount,
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
    const response = await fetch(`/bff/api/v1/posts${query ? `?${query}` : ""}`, {
      method: "GET",
      cache: "no-store",
    });
    const responseBody =
      (await response.json()) as ApiResponse<CollectionPayload<PostApiItem>>;

    return mapPostListApiResponseToDto(responseBody);
  }

  async createPost(requestBody: SavePostRequestDto): Promise<number> {
    const response = await fetch("/bff/api/v1/posts", {
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
    const response = await fetch(`/bff/api/v1/posts/${postId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    return response.status;
  }
}

export const dummyPostCategoryRepository = new DummyPostCategoryRepository();
export const dummyPostRepository = new DummyPostRepository();
export const browserDummyPostRepository = new BrowserDummyPostRepository();
