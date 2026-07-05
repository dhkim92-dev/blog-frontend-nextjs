"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditorView from "@/app/shared/markdown-editor-view";
import {
  browserDummyPostRepository,
  type PostCategoryDto,
  type PostDetailDto,
  type SavePostRequestDto,
} from "./browser-dummy-post-repositories";

type PostEditorViewProps = {
  categories: PostCategoryDto[];
  initialPost: PostDetailDto | null;
  mode: "create" | "edit";
};

export default function PostEditorView({
  categories,
  initialPost,
  mode,
}: PostEditorViewProps) {
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);
  const isEditMode = mode === "edit";
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialPost?.category.id ?? categories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
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

    const normalizedTitle = title.trim();
    const hasContent = content.trim().length > 0;

    if (!normalizedTitle || !selectedCategoryId || !hasContent) {
      setErrorMessage("카테고리, 제목, 본문을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const requestBody: SavePostRequestDto = {
      categoryId: selectedCategoryId,
      title: normalizedTitle,
      content,
      status: "PUBLISHED",
    };

    try {
      const responseStatus =
        isEditMode && initialPost
          ? await browserDummyPostRepository.updatePost(
              initialPost.id,
              requestBody,
            )
          : await browserDummyPostRepository.createPost(requestBody);

      if (responseStatus !== 200 && responseStatus !== 201) {
        setErrorMessage("게시물 저장에 실패했습니다.");
        return;
      }

      setToastMessage("게시물이 작성되었습니다");
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/posts");
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

    router.push("/posts");
  }

  return (
    <section className="post-editor-page-root">
      <MarkdownEditorView
        header={
          <div className="post-editor-title-container">
            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              className="post-editor-category-select"
              aria-label="Post Category"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={255}
              className="post-editor-title-input"
              placeholder="게시물 제목을 입력하세요."
              aria-label="Post Title"
            />
          </div>
        }
        content={content}
        onContentChange={setContent}
        contentPlaceholder="Markdown 본문을 작성하세요."
        isSubmitting={isSubmitting}
        submitLabel="제출"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        leftControls={
          <>
            <button type="button" className="post-editor-secondary-button">
              초안 불러오기
            </button>
            <button type="button" className="post-editor-secondary-button">
              초안 등록
            </button>
          </>
        }
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
