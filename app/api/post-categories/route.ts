import { NextResponse } from "next/server";
import {
  createCategoryListApiResponse,
  createPostCategoryApiResponse,
  type SavePostCategoryRequestDto,
} from "@/app/posts/dummy-post-repositories";

export async function GET() {
  const response = await createCategoryListApiResponse();

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const requestBody = (await request.json()) as SavePostCategoryRequestDto;
  const response = await createPostCategoryApiResponse(requestBody);

  return NextResponse.json(response, { status: response.status });
}
