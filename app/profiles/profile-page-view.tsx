"use client";

import { useState } from "react";
import { useCommandLoading } from "@/app/shared/command-loading-provider";
import ErrorToast, { type ErrorToastState } from "@/app/shared/error-toast";
import { browserApiMemberRepository } from "./browser-api-member-repository";
import type {
  MemberAuthAccountDto,
  MemberProfileDto,
} from "./profile-types";

type ProfilePageViewProps = {
  displayName: string;
  memberId: string | null;
  roles: string[];
  initialMemberProfile: MemberProfileDto | null;
  authAccount: MemberAuthAccountDto | null;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default function ProfilePageView({
  displayName,
  memberId,
  roles,
  initialMemberProfile,
  authAccount,
}: ProfilePageViewProps) {
  const { startCommand } = useCommandLoading();
  const [nickname, setNickname] = useState(initialMemberProfile?.nickname ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState<ErrorToastState | null>(null);

  const isCreateMode = initialMemberProfile === null;
  const normalizedNickname = nickname.trim();

  function showErrorToast(message: string) {
    setErrorToast({
      id: Date.now(),
      message,
    });
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (normalizedNickname.length < 3 || normalizedNickname.length > 20) {
      showErrorToast("닉네임은 3자 이상 20자 이하여야 합니다.");
      return;
    }

    if (!memberId && !isCreateMode) {
      showErrorToast("회원 ID를 확인할 수 없습니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorToast(null);
    const command = startCommand();
    let shouldDismissCommand = true;

    try {
      const result = isCreateMode
        ? await browserApiMemberRepository.createMember({
            nickname: normalizedNickname,
          })
        : await browserApiMemberRepository.updateMember(memberId!, {
            nickname: normalizedNickname,
          });

      const isSuccess = isCreateMode
        ? result.status === 201
        : result.status === 200 || result.status === 204;

      if (!isSuccess) {
        showErrorToast(result.message || "회원 정보 저장에 실패했습니다.");
        return;
      }

      shouldDismissCommand = false;
      await command.redirect("/profiles", { replace: true });
    } finally {
      if (shouldDismissCommand) {
        await command.dismiss();
      }

      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorToast(null);
    const command = startCommand();
    let shouldDismissCommand = true;

    try {
      const result = await browserApiMemberRepository.logout();

      if (result.status !== 200 && result.status !== 204) {
        showErrorToast(result.message || "로그아웃에 실패했습니다.");
        return;
      }

      shouldDismissCommand = false;
      await command.redirect("/", { replace: true });
    } finally {
      if (shouldDismissCommand) {
        await command.dismiss();
      }

      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!memberId || isSubmitting) {
      return;
    }

    const typedMemberId = window.prompt(
      `회원 탈퇴를 진행하려면 사용자ID ${memberId} 를 입력하세요.`,
      "",
    );

    if (typedMemberId === null) {
      return;
    }

    if (typedMemberId.trim() !== memberId) {
      window.alert("사용자ID가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorToast(null);
    const command = startCommand();
    let shouldDismissCommand = true;

    try {
      const result = await browserApiMemberRepository.deleteMember(memberId);

      if (result.status !== 204) {
        showErrorToast(result.message || "회원 탈퇴에 실패했습니다.");
        return;
      }

      shouldDismissCommand = false;
      await command.redirect("/", { replace: true });
    } finally {
      if (shouldDismissCommand) {
        await command.dismiss();
      }

      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex flex-1 px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-[13px] font-semibold tracking-[0.22em] text-zinc-500">
                MEMBER PROFILE
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-white md:text-4xl">
                  {isCreateMode ? "회원 정보를 생성하세요." : "회원 정보 관리"}
                </h1>
                <p className="max-w-2xl text-[16px] leading-7 text-zinc-400">
                  {isCreateMode
                    ? "로그인 상태에서 사용할 닉네임을 등록하면 헤더 우측에 즉시 반영됩니다."
                    : "닉네임 수정과 인증 정보 확인, 로그아웃과 회원 탈퇴를 여기서 처리합니다."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-zinc-200">
                {displayName}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-zinc-400">
                {roles.map((role) => role.replace(/^ROLE_/, "")).join(", ") || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-semibold text-white">
                  {isCreateMode ? "프로필 생성" : "프로필 수정"}
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-zinc-400">
                  닉네임은 3자 이상 20자 이하여야 합니다.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="profile-nickname"
                  className="text-sm font-medium text-zinc-300"
                >
                  닉네임
                </label>
                <input
                  id="profile-nickname"
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  maxLength={20}
                  disabled={isSubmitting}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-[16px] text-white outline-none transition focus:border-white/30"
                  placeholder="닉네임을 입력하세요."
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={isSubmitting}
                className="inline-flex min-w-[132px] items-center justify-center rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-500"
              >
                {isCreateMode ? "프로필 생성" : "프로필 저장"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-6 md:p-8">
              <h2 className="text-[22px] font-semibold text-white">기본 정보</h2>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-sm text-zinc-500">사용자ID</dt>
                  <dd className="mt-1 break-all text-[15px] text-zinc-200">
                    {memberId ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">현재 닉네임</dt>
                  <dd className="mt-1 text-[15px] text-zinc-200">
                    {initialMemberProfile?.nickname ?? displayName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">프로필 생성일</dt>
                  <dd className="mt-1 text-[15px] text-zinc-200">
                    {formatDateTime(initialMemberProfile?.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-6 md:p-8">
              <h2 className="text-[22px] font-semibold text-white">인증 정보</h2>
              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="text-sm text-zinc-500">이메일 인증</dt>
                  <dd className="mt-1 break-all text-[15px] text-zinc-200">
                    {authAccount?.email?.address ?? "연결된 이메일 인증 정보가 없습니다."}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">OAuth2 인증</dt>
                  <dd className="mt-1 text-[15px] text-zinc-200">
                    {authAccount?.oauth
                      ? `${authAccount.oauth.provider} / ${authAccount.oauth.userId}`
                      : "연결된 OAuth2 인증 정보가 없습니다."}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-white">계정 작업</h2>
              <p className="mt-2 text-[15px] leading-6 text-zinc-400">
                로그아웃은 현재 세션만 종료하고, 회원 탈퇴는 계정을 삭제합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-[15px] font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:text-zinc-500"
              >
                로그아웃
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleDelete();
                }}
                disabled={isSubmitting || !memberId}
                className="inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-400/[0.08] px-5 py-3 text-[15px] font-semibold text-red-200 transition hover:border-red-300/50 hover:bg-red-400/[0.12] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-zinc-500"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>

        <ErrorToast
          toast={errorToast}
          onClear={(toastId) =>
            setErrorToast((currentToast) =>
              currentToast?.id === toastId ? null : currentToast,
            )
          }
        />
      </div>
    </section>
  );
}
