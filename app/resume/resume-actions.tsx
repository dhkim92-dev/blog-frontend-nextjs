"use client";

import Link from "next/link";
import { useCommandLoading } from "@/app/shared/command-loading-provider";
import { browserApiResumeRepository } from "./browser-api-resume-repository";

type ResumeActionsProps = {
  hasResume: boolean;
  resumeId: string | null;
  canManage: boolean;
};

export default function ResumeActions({
  hasResume,
  resumeId,
  canManage,
}: ResumeActionsProps) {
  const { startCommand } = useCommandLoading();

  async function handleDelete() {
    const shouldDelete = window.confirm("이력서를 삭제하시겠습니까?");

    if (!shouldDelete) {
      return;
    }

    const command = startCommand();
    if (!resumeId) {
      return;
    }

    const result = await browserApiResumeRepository.deleteResume(resumeId);

    if (result.status !== 200 && result.status !== 204) {
      await command.dismiss();
      window.alert(result.message || "이력서 삭제에 실패했습니다.");
      return;
    }

    await command.redirect();
  }

  if (!canManage) {
    return null;
  }

  if (!hasResume) {
    return (
      <div className="resume-actions">
        <Link href="/resume?mode=edit" className="resume-action-link">
          추가
        </Link>
      </div>
    );
  }

  return (
    <div className="resume-actions">
      <Link href="/resume?mode=edit" className="resume-action-link">
        수정
      </Link>
      <span className="resume-action-divider">·</span>
      <button
        type="button"
        className="resume-action-button"
        onClick={() => {
          void handleDelete();
        }}
      >
        삭제
      </button>
    </div>
  );
}
