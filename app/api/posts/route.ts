import { NextResponse } from "next/server";
import {
  createPostApiResponse,
  createPostListApiResponse,
  type SavePostRequestDto,
} from "@/app/posts/dummy-post-repositories";

type RouteContext = {
  request: Request;
};

export async function GET(request: RouteContext["request"]) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const cursor = searchParams.get("cursor");
  const response = await createPostListApiResponse(categoryId, cursor);

  return NextResponse.json(response);
}

export async function POST(request: RouteContext["request"]) {
  const requestBody = (await request.json()) as SavePostRequestDto;
  const response = await createPostApiResponse(requestBody);

  return NextResponse.json(response, { status: 201 });
}
