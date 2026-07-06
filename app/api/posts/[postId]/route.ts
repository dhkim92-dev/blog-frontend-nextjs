import { forwardPostApiRequest } from "../proxy";

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { postId } = await context.params;

  return forwardPostApiRequest(request, `/api/v1/posts/${postId}`, {
    method: "GET",
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const { postId } = await context.params;

  return forwardPostApiRequest(request, `/api/v1/posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: await request.text(),
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { postId } = await context.params;

  return forwardPostApiRequest(request, `/api/v1/posts/${postId}`, {
    method: "DELETE",
  });
}
