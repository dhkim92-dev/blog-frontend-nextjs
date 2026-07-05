import { forwardPostCategoryApiRequest } from "./proxy";

export async function GET(request: Request) {
  return forwardPostCategoryApiRequest(request, "/api/v1/post-categories", {
    method: "GET",
  });
}

export async function POST(request: Request) {
  return forwardPostCategoryApiRequest(request, "/api/v1/post-categories", {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: await request.text(),
  });
}
