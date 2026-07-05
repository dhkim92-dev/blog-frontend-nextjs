import { forwardPostCategoryApiRequest } from "../proxy";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { categoryId } = await context.params;

  return forwardPostCategoryApiRequest(
    request,
    `/api/v1/post-categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          request.headers.get("content-type") ?? "application/json",
      },
      body: await request.text(),
    },
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const { categoryId } = await context.params;

  return forwardPostCategoryApiRequest(
    request,
    `/api/v1/post-categories/${categoryId}`,
    {
      method: "DELETE",
    },
  );
}
