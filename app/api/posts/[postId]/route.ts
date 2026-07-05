import { NextResponse } from "next/server";
import {
  createPostDetailApiResponse,
  deletePostApiResponse,
  type SavePostRequestDto,
  updatePostApiResponse,
} from "@/app/posts/dummy-post-repositories";

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { postId } = await context.params;
  const response = await createPostDetailApiResponse(postId);

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "post not found",
        code: "POST_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response);
}

export async function PUT(request: Request, context: RouteContext) {
  const { postId } = await context.params;
  const requestBody = (await request.json()) as SavePostRequestDto;
  const response = await updatePostApiResponse(postId, requestBody);

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "post not found",
        code: "POST_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response, { status: 200 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { postId } = await context.params;
  const response = await deletePostApiResponse(postId);

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "post not found",
        code: "POST_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response, { status: response.status });
}
