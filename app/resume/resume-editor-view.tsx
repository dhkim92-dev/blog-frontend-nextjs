"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditorView from "@/app/shared/markdown-editor-view";
import { browserDummyResumeRepository } from "./browser-dummy-resume-repositories";
import type { ResumeDetailDto, SaveResumeRequestDto } from "./resume-types";

type ResumeEditorViewProps = {
  initialResume: ResumeDetailDto | null;
};

export default function ResumeEditorView({
  initialResume,
}: ResumeEditorViewProps) {
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);
  const [content, setContent] = useState(initialResume?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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

      setToastMessage("이력서가 저장되었습니다");
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/resume");
        router.refresh();
      }, 900);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/resume");
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

      {toastMessage ? (
        <div className="post-editor-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </section>
  );
}
