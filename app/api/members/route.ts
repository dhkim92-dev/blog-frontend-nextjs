import { forwardMemberProfileMutationApiRequest } from "./proxy";

export async function POST(request: Request) {
  return forwardMemberProfileMutationApiRequest(request, "/api/v1/members", {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: await request.text(),
  });
}
