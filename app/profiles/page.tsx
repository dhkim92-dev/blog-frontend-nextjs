import { redirect } from "next/navigation";
import {
  getCurrentServerAuthentication,
  getServerAuthenticationDisplayName,
} from "@/app/login/server-auth";
import {
  apiMemberRepository,
  MemberAuthenticationExpiredError,
} from "./api-member-repository";
import ProfilePageView from "./profile-page-view";

export default async function ProfilesPage() {
  const authentication = await getCurrentServerAuthentication();

  if (!authentication.isAuthenticated) {
    redirect("/login");
  }

  const memberId = authentication.claims.memberId ?? null;
  const authAccountId = authentication.claims.sub;
  let memberProfile = null;
  let authAccount = null;

  try {
    [memberProfile, authAccount] = await Promise.all([
      memberId ? apiMemberRepository.getMemberById(memberId) : Promise.resolve(null),
      authAccountId
        ? apiMemberRepository.getAuthAccountById(authAccountId)
        : Promise.resolve(null),
    ]);
  } catch (error) {
    if (error instanceof MemberAuthenticationExpiredError) {
      redirect("/login");
    }

    throw error;
  }

  return (
    <ProfilePageView
      displayName={getServerAuthenticationDisplayName(authentication)}
      memberId={memberId}
      roles={authentication.claims.roles ?? []}
      initialMemberProfile={memberProfile}
      authAccount={authAccount}
    />
  );
}
