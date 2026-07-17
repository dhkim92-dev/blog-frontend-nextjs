import { forwardMemberRequest } from "./proxy";

export async function POST(request: Request) {
  return forwardMemberRequest(
    request,
    "/api/v1/members",
    {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      body: await request.text(),
    },
    true,
  );
}
