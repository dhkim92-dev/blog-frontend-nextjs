import {
  forwardMemberApiRequest,
  forwardMemberDeleteApiRequest,
  forwardMemberProfileMutationApiRequest,
} from "../proxy";

type MemberRouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function GET(request: Request, context: MemberRouteContext) {
  const { memberId } = await context.params;

  return forwardMemberApiRequest(request, `/api/v1/members/${memberId}`, {
    method: "GET",
  });
}

export async function PUT(request: Request, context: MemberRouteContext) {
  const { memberId } = await context.params;

  return forwardMemberProfileMutationApiRequest(
    request,
    `/api/v1/members/${memberId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          request.headers.get("content-type") ?? "application/json",
      },
      body: await request.text(),
    },
  );
}

export async function DELETE(request: Request, context: MemberRouteContext) {
  const { memberId } = await context.params;

  return forwardMemberDeleteApiRequest(request, memberId);
}
