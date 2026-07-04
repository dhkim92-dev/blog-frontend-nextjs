import { NextResponse } from "next/server";
import { createPostListApiResponse } from "@/app/posts/dummy-post-repositories";

type RouteContext = {
  request: Request;
};

export async function GET(request: RouteContext["request"]) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const cursor = searchParams.get("cursor");
  const response = createPostListApiResponse(categoryId, cursor);

  return NextResponse.json(response);
}
