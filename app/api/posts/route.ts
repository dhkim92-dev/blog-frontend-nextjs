import { forwardPostApiRequest } from "./proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const upstreamSearch = new URLSearchParams();
  const categoryId = searchParams.get("categoryId");
  const cursor = searchParams.get("cursor");

  if (categoryId) {
    upstreamSearch.set("categoryId", categoryId);
  }

  if (cursor) {
    upstreamSearch.set("cursor", cursor);
  }

  const query = upstreamSearch.toString();

  return forwardPostApiRequest(
    request,
    `/api/v1/posts${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );
}

export async function POST(request: Request) {
  return forwardPostApiRequest(request, "/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: await request.text(),
  });
}
