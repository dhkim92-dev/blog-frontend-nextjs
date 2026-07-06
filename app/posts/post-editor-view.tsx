"use client";

import { useState } from "react";
import { useCommandLoading } from "@/app/shared/command-loading-provider";
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
  const { startCommand } = useCommandLoading();
  const isEditMode = mode === "edit";
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialPost?.category.id ?? categories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const normalizedTitle = title.trim();
    const hasContent = content.trim().length > 0;

    if (!normalizedTitle || !selectedCategoryId || !hasContent) {
      window.alert("카테고리, 제목, 본문을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const command = startCommand();
    let shouldDismissCommand = true;

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
        window.alert("게시물 저장에 실패했습니다.");
        return;
      }

      shouldDismissCommand = false;
      await command.redirect("/posts");
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

    window.location.assign("/posts");
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
    </section>
  );
}
