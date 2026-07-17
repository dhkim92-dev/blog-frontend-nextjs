import { forwardMemberDeleteRequest, forwardMemberRequest } from "../proxy";

type MemberRouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function PUT(request: Request, context: MemberRouteContext) {
  const { memberId } = await context.params;

  return forwardMemberRequest(
    request,
    `/api/v1/members/${memberId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      body: await request.text(),
    },
    true,
  );
}

export async function DELETE(request: Request, context: MemberRouteContext) {
  const { memberId } = await context.params;

  return forwardMemberDeleteRequest(request, memberId);
}
