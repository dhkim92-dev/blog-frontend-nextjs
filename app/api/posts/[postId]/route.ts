import { NextResponse } from "next/server";
import { createPostDetailApiResponse } from "@/app/posts/dummy-post-repositories";

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
  const response = createPostDetailApiResponse(postId);

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
