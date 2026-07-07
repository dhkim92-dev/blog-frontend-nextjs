import "server-only";
import { cookies } from "next/headers";
import {
  fetchApiServerWithCookieHeader,
  type ApiServerFetchResult,
} from "@/app/login/api-server-fetch";

export async function fetchCurrentServerApi(
  input: URL | string,
  init: RequestInit,
): Promise<ApiServerFetchResult> {
  return fetchApiServerWithCookieHeader((await cookies()).toString(), input, init);
}
