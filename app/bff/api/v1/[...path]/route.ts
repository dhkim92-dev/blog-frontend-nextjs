import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBackendApiHost } from "@/app/shared/runtime-config";
import {
  applyRefreshedAuthentication,
  createSessionExpiredResponse,
  fetchApiServer,
} from "@/app/login/api-server-fetch";
import { RESUME_CACHE_TAG } from "@/app/resume/resume-cache";

type ApiRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyApiRequest(request: Request, context: ApiRouteContext) {
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `/api/v1/${path.map(encodeURIComponent).join("/")}`,
    getBackendApiHost(),
  );
  upstreamUrl.search = requestUrl.search;
  const contentType = request.headers.get("content-type");
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  try {
    const result = await fetchApiServer(request, upstreamUrl, {
      method: request.method,
      headers: contentType ? { "Content-Type": contentType } : undefined,
      body,
      cache: "no-store",
    });

    if (result.sessionExpired) {
      return createSessionExpiredResponse(result.sessionId);
    }

    const responseText = await result.upstreamResponse.text();
    const response = new NextResponse(responseText || null, {
      status: result.upstreamResponse.status,
    });
    const upstreamContentType = result.upstreamResponse.headers.get(
      "content-type",
    );

    if (upstreamContentType) {
      response.headers.set("content-type", upstreamContentType);
    }

    await applyRefreshedAuthentication(response.cookies, result);

    if (
      result.upstreamResponse.ok &&
      path[0] === "resumes" &&
      ["POST", "PUT", "DELETE"].includes(request.method)
    ) {
      revalidateTag(RESUME_CACHE_TAG, { expire: 0 });
      revalidatePath("/resume");
    }

    return response;
  } catch {
    return NextResponse.json(
      {
        status: 502,
        code: "API_UPSTREAM_UNAVAILABLE",
        message: "API 서버에 연결하지 못했습니다.",
        errors: [],
      },
      { status: 502 },
    );
  }
}

export const GET = proxyApiRequest;
export const POST = proxyApiRequest;
export const PUT = proxyApiRequest;
export const PATCH = proxyApiRequest;
export const DELETE = proxyApiRequest;
