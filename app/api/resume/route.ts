import { NextResponse } from "next/server";
import {
  createResumeApiResponse,
  createResumeDetailApiResponse,
  deleteResumeApiResponse,
  updateResumeApiResponse,
} from "@/app/resume/dummy-resume-repositories";
import type { SaveResumeRequestDto } from "@/app/resume/resume-types";

export async function GET() {
  const response = await createResumeDetailApiResponse();

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "resume not found",
        code: "RESUME_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const requestBody = (await request.json()) as SaveResumeRequestDto;
  const response = await createResumeApiResponse(requestBody);

  return NextResponse.json(response, { status: response.status });
}

export async function PUT(request: Request) {
  const requestBody = (await request.json()) as SaveResumeRequestDto;
  const response = await updateResumeApiResponse(requestBody);

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "resume not found",
        code: "RESUME_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response, { status: response.status });
}

export async function DELETE() {
  const response = await deleteResumeApiResponse();

  if (!response) {
    return NextResponse.json(
      {
        status: 404,
        payload: null,
        message: "resume not found",
        code: "RESUME_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(response, { status: response.status });
}
