import { NextResponse } from "next/server";
import {
  deletePostCategoryApiResponse,
  type SavePostCategoryRequestDto,
  updatePostCategoryApiResponse,
} from "@/app/posts/dummy-post-repositories";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { categoryId } = await context.params;
  const requestBody = (await request.json()) as SavePostCategoryRequestDto;
  const response = await updatePostCategoryApiResponse(categoryId, requestBody);

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "category not found",
        code: "CATEGORY_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response, { status: response.status });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { categoryId } = await context.params;
  const response = await deletePostCategoryApiResponse(categoryId);

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "category not found",
        code: "CATEGORY_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response, { status: response.status });
}
