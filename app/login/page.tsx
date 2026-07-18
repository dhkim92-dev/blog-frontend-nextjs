import "./login-view.css";
import LoginView from "./login-view";
import { getGithubOAuthAuthorizeUrl } from "./auth-session";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialErrorCode = Array.isArray(resolvedSearchParams.error)
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams.error;
  const oauthProviders = [
    {
      id: "github",
      label: "GitHub",
      imageSrc: "/github.png",
      authorizeUrl: getGithubOAuthAuthorizeUrl(),
    },
  ];

  return (
    <LoginView
      oauthProviders={oauthProviders}
      initialErrorCode={initialErrorCode ?? null}
    />
  );
}
