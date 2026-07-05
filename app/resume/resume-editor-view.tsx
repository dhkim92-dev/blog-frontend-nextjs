"use client";

import { useState } from "react";
import { useCommandLoading } from "@/app/shared/command-loading-provider";
import MarkdownEditorView from "@/app/shared/markdown-editor-view";
import { browserDummyResumeRepository } from "./browser-dummy-resume-repositories";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (!content.trim()) {
      setErrorMessage("이력서 본문을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const command = startCommand();
    let shouldDismissCommand = true;

    const requestBody: SaveResumeRequestDto = {
      content,
    };

    try {
      const result = initialResume
        ? await browserDummyResumeRepository.updateResume(requestBody)
        : await browserDummyResumeRepository.createResume(requestBody);

      if (result.status !== 200 && result.status !== 201) {
        setErrorMessage("이력서 저장에 실패했습니다.");
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

      {errorMessage ? (
        <div className="post-editor-feedback" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
