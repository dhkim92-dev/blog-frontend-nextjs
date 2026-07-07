import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/app/login/auth-session";
import {
  applyRefreshedAuthentication,
  createSessionExpiredResponse,
  fetchApiServer,
  type ApiServerFetchResult,
} from "@/app/login/api-server-fetch";
import { getApiPayload } from "@/app/shared/api-envelope";
import type { SaveResumeRequestDto } from "@/app/resume/resume-types";

type ResumePayload = {
  id: string;
  type?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

type ResumeMutationRequestBody = {
  type: "MARKDOWN";
  content: string;
};

function createUpstreamUnavailableResponse() {
  return NextResponse.json(
    {
      status: 502,
      code: "RESUME_UPSTREAM_UNAVAILABLE",
      message: "이력서 서버에 연결하지 못했습니다.",
      errors: [],
    },
    { status: 502 },
  );
}

async function createProxyResponse(
  result: ApiServerFetchResult,
  responseText?: string,
  authenticationResult: ApiServerFetchResult = result,
) {
  const resolvedResponseText =
    typeof responseText === "string"
      ? responseText
      : await result.upstreamResponse.text();
  const response = new NextResponse(resolvedResponseText || null, {
    status: result.upstreamResponse.status,
  });
  const contentType = result.upstreamResponse.headers.get("content-type");

  if (contentType) {
    response.headers.set("content-type", contentType);
  }

  await applyRefreshedAuthentication(response.cookies, authenticationResult);

  return response;
}

function createUpstreamResumeRequestBody(
  requestBody: SaveResumeRequestDto,
): ResumeMutationRequestBody {
  return {
    type: "MARKDOWN",
    content: requestBody.content,
  };
}

function getLatestResumeNotFoundResponseBody() {
  return {
    status: 200,
    payload: null,
    message: "resume not found",
    code: "RESUME_NOT_FOUND",
  };
}

function isResumeNotFoundResponse(params: {
  httpStatus: number;
  responseBody: {
    status: number;
    code: string;
    payload: ResumePayload | null;
  } | null;
}) {
  const { httpStatus, responseBody } = params;

  if (httpStatus === 404) {
    return true;
  }

  if (!responseBody) {
    return false;
  }

  return (
    responseBody.status === 404 ||
    responseBody.code.endsWith("_NOT_FOUND") ||
    responseBody.payload === null
  );
}

function parseResumeEnvelope(responseText: string) {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as {
      status: number;
      code: string;
      message?: string | null;
      payload: ResumePayload | null;
    };
  } catch {
    return null;
  }
}

async function forwardResumeApiRequest(
  request: Request,
  pathname: string,
  init: RequestInit,
) {
  const upstreamUrl = new URL(pathname, getApiBaseUrl());
  let result: ApiServerFetchResult;

  try {
    result = await fetchApiServer(request, upstreamUrl, {
      ...init,
      cache: "no-store",
    });
  } catch {
    return createUpstreamUnavailableResponse();
  }

  if (result.refreshTokenRemoved) {
    return createSessionExpiredResponse(result.sessionId);
  }

  return createProxyResponse(result);
}

async function resolveLatestResumeId(request: Request) {
  let result: ApiServerFetchResult;

  try {
    result = await fetchApiServer(
      request,
      new URL("/api/v1/resumes", getApiBaseUrl()),
      {
        method: "GET",
        cache: "no-store",
      },
    );
  } catch {
    return {
      response: createUpstreamUnavailableResponse(),
    };
  }

  if (result.refreshTokenRemoved) {
    return {
      response: await createSessionExpiredResponse(result.sessionId),
    };
  }

  const responseText = await result.upstreamResponse.text();
  const responseBody = parseResumeEnvelope(responseText);
  const payload = getApiPayload(responseBody);

  if (!result.upstreamResponse.ok || !payload?.id) {
    if (!result.upstreamResponse.ok || responseText) {
      return {
        response: await createProxyResponse(result, responseText),
      };
    }

    const response = NextResponse.json(getLatestResumeNotFoundResponseBody(), {
      status: 404,
    });
    await applyRefreshedAuthentication(response.cookies, result);

    return {
      response,
    };
  }

  return {
    resumeId: payload.id,
    authResult: result,
  };
}

async function forwardResumeByIdApiRequest(
  request: Request,
  resumeId: string,
  init: RequestInit,
  resolvedResumeResult: ApiServerFetchResult,
) {
  const upstreamUrl = new URL(`/api/v1/resumes/${resumeId}`, getApiBaseUrl());
  let result: ApiServerFetchResult;

  try {
    result = await fetchApiServer(request, upstreamUrl, {
      ...init,
      cache: "no-store",
    });
  } catch {
    return createUpstreamUnavailableResponse();
  }

  if (result.refreshTokenRemoved) {
    return createSessionExpiredResponse(result.sessionId);
  }

  const response = await createProxyResponse(
    result,
    undefined,
    result.refreshedTokens ? result : resolvedResumeResult,
  );

  return response;
}

export async function GET(request: Request) {
  const upstreamUrl = new URL("/api/v1/resumes", getApiBaseUrl());
  let result: ApiServerFetchResult;

  try {
    result = await fetchApiServer(request, upstreamUrl, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    return createUpstreamUnavailableResponse();
  }

  if (result.refreshTokenRemoved) {
    return createSessionExpiredResponse(result.sessionId);
  }

  const responseText = await result.upstreamResponse.text();
  const responseBody = parseResumeEnvelope(responseText);

  if (
    isResumeNotFoundResponse({
      httpStatus: result.upstreamResponse.status,
      responseBody,
    })
  ) {
    const response = NextResponse.json(getLatestResumeNotFoundResponseBody());
    await applyRefreshedAuthentication(response.cookies, result);

    return response;
  }

  return createProxyResponse(result, responseText);
}

export async function POST(request: Request) {
  const requestBody = (await request.json()) as SaveResumeRequestDto;

  return forwardResumeApiRequest(request, "/api/v1/resumes", {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: JSON.stringify(createUpstreamResumeRequestBody(requestBody)),
  });
}

export async function PUT(request: Request) {
  const requestBody = (await request.json()) as SaveResumeRequestDto;
  const latestResumeResult = await resolveLatestResumeId(request);

  if ("response" in latestResumeResult) {
    return latestResumeResult.response;
  }

  return forwardResumeByIdApiRequest(
    request,
    latestResumeResult.resumeId,
    {
      method: "PUT",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      body: JSON.stringify(createUpstreamResumeRequestBody(requestBody)),
    },
    latestResumeResult.authResult,
  );
}

export async function DELETE(request: Request) {
  const latestResumeResult = await resolveLatestResumeId(request);

  if ("response" in latestResumeResult) {
    return latestResumeResult.response;
  }

  return forwardResumeByIdApiRequest(
    request,
    latestResumeResult.resumeId,
    {
      method: "DELETE",
    },
    latestResumeResult.authResult,
  );
}
