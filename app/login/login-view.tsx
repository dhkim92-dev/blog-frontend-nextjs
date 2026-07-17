"use client";

import Image from "next/image";
import { useState } from "react";
import { browserAuthFetch } from "@/app/shared/browser-auth-fetch";
import { useCommandLoading } from "@/app/shared/command-loading-provider";

type OAuthProvider = {
  id: string;
  label: string;
  imageSrc: string;
  authorizeUrl: string;
};

type LoginViewProps = {
  oauthProviders: OAuthProvider[];
  initialErrorCode?: string | null;
};

type LoginApiResponse = {
  status: number;
  payload: {
    type: string;
    refreshToken: string;
    accessToken: string;
  } | null;
  code: string;
  message?: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOGIN_ERROR_MESSAGE_BY_CODE: Record<string, string> = {
  oauth_failed: "OAuth2 로그인에 실패했습니다.",
  oauth_tokens_missing: "OAuth2 인증 정보를 받지 못했습니다.",
  oauth_refresh_token_missing: "OAuth2 리프레시 토큰을 받지 못했습니다.",
  oauth_reissue_failed: "OAuth2 인증 정보를 구성하지 못했습니다.",
};

export default function LoginView({
  oauthProviders,
  initialErrorCode,
}: LoginViewProps) {
  const { startCommand } = useCommandLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<
    string | null
  >(null);

  const trimmedEmail = email.trim();
  const isEmailFormatInvalid =
    hasTriedSubmit && (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail));
  const oauthErrorMessage = initialErrorCode
    ? LOGIN_ERROR_MESSAGE_BY_CODE[initialErrorCode] ?? "로그인에 실패했습니다."
    : null;

  async function submitLogin() {
    setHasTriedSubmit(true);
    setSubmissionErrorMessage(null);

    if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
      return;
    }

    if (!password) {
      setSubmissionErrorMessage("비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const command = startCommand();
    let shouldDismissCommand = true;

    try {
      const response = await browserAuthFetch("/bff/api/auth/email-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as LoginApiResponse | null;

      if (!response.ok) {
        setSubmissionErrorMessage(
          responseBody?.message ?? "로그인에 실패했습니다.",
        );
        return;
      }

      shouldDismissCommand = false;
      await command.redirect("/", { replace: true });
    } catch {
      setSubmissionErrorMessage("로그인 요청에 실패했습니다.");
    } finally {
      if (shouldDismissCommand) {
        await command.dismiss();
      }

      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-view-root">
      <div className="login-view-panel">
        <div className="login-view-copy">
          <p className="login-view-eyebrow">Authentication</p>
        </div>

        <form
          className="login-view-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitLogin();
          }}
          noValidate
        >
          <div className="login-view-field-group">
            <label className="login-view-field-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className={`login-view-input${isEmailFormatInvalid ? " is-error" : ""}`}
              placeholder="dhkim92.dev@gmail.com"
              aria-invalid={isEmailFormatInvalid}
              aria-describedby={
                isEmailFormatInvalid ? "login-email-error" : undefined
              }
              disabled={isSubmitting}
            />
            {isEmailFormatInvalid ? (
              <p id="login-email-error" className="login-view-field-error">
                잘못된 이메일 형식입니다
              </p>
            ) : null}
          </div>

          <div className="login-view-field-group">
            <label className="login-view-field-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="login-view-input"
              placeholder="비밀번호를 입력하세요."
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="login-view-hidden-submit"
            tabIndex={-1}
            aria-hidden="true"
          >
            로그인
          </button>
        </form>

        {oauthErrorMessage || submissionErrorMessage ? (
          <div className="login-view-feedback" role="alert">
            {submissionErrorMessage ?? oauthErrorMessage}
          </div>
        ) : null}

        <div className="login-view-divider" aria-hidden="true">
          <span />
          <p>or continue with</p>
          <span />
        </div>

        <div className="login-view-oauth-list">
          {oauthProviders.map((provider) => (
            <a
              key={provider.id}
              href={provider.authorizeUrl}
              className="login-view-oauth-button"
              title={provider.label}
              aria-label={`${provider.label} 로그인`}
            >
              <span className="login-view-oauth-icon">
                <Image
                  src={provider.imageSrc}
                  alt={provider.label}
                  width={56}
                  height={56}
                />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
