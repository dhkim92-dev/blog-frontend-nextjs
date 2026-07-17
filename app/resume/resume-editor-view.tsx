"use client";

import { useState } from "react";
import { useCommandLoading } from "@/app/shared/command-loading-provider";
import ErrorToast, { type ErrorToastState } from "@/app/shared/error-toast";
import MarkdownEditorView from "@/app/shared/markdown-editor-view";
import { browserApiResumeRepository } from "./browser-api-resume-repository";
import type { ResumeDetailDto, SaveResumeRequestDto } from "./resume-types";

type ResumeEditorViewProps = {
  initialResume: ResumeDetailDto | null;
};

export default function ResumeEditorView({
  initialResume,
}: ResumeEditorViewProps) {
  const { startCommand } = useCommandLoading();
  const [content, setContent] = useState(initialResume?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState<ErrorToastState | null>(null);

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

    if (!content.trim()) {
      showErrorToast("이력서 본문을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorToast(null);
    const command = startCommand();
    let shouldDismissCommand = true;

    const requestBody: SaveResumeRequestDto = {
      content,
    };

    try {
      const result = initialResume
        ? await browserApiResumeRepository.updateResume(
            initialResume.id,
            requestBody,
          )
        : await browserApiResumeRepository.createResume(requestBody);

      if (
        result.status !== 200 &&
        result.status !== 201 &&
        result.status !== 204
      ) {
        showErrorToast("이력서 저장에 실패했습니다.");
        return;
      }

      shouldDismissCommand = false;
      await command.redirect("/resume");
    } finally {
      if (shouldDismissCommand) {
        await command.dismiss();
      }

      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/resume");
  }

  return (
    <section className="post-editor-page-root">
      <MarkdownEditorView
        content={content}
        onContentChange={setContent}
        contentPlaceholder="Markdown 이력서를 작성하세요."
        isSubmitting={isSubmitting}
        submitLabel="저장"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <ErrorToast
        toast={errorToast}
        onClear={(toastId) => {
          setErrorToast((current) => (current?.id === toastId ? null : current));
        }}
      />
    </section>
  );
}
