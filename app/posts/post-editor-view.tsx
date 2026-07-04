"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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

const MIN_EDITOR_HEIGHT = 480;
const MAX_EDITOR_HEIGHT = 720;
const PostEditorPreview = dynamic(() => import("./post-editor-preview"), {
  ssr: false,
  loading: () => (
    <div className="post-editor-preview-empty">
      프리뷰를 불러오는 중입니다.
    </div>
  ),
});

export default function PostEditorView({
  categories,
  initialPost,
  mode,
}: PostEditorViewProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const selectionRef = useRef({
    start: 0,
    end: 0,
  });
  const isEditMode = mode === "edit";
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialPost?.category.id ?? categories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isYoutubeInputVisible, setIsYoutubeInputVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function syncEditorHeight() {
    const editorElement = editorRef.current;

    if (!editorElement) {
      return;
    }

    editorElement.style.height = `${MIN_EDITOR_HEIGHT}px`;

    const nextHeight = Math.min(
      Math.max(editorElement.scrollHeight, MIN_EDITOR_HEIGHT),
      MAX_EDITOR_HEIGHT,
    );

    editorElement.style.height = `${nextHeight}px`;
    editorElement.style.overflowY =
      editorElement.scrollHeight > MAX_EDITOR_HEIGHT ? "auto" : "hidden";
  }

  useEffect(() => {
    syncEditorHeight();
  }, [content]);

  useEffect(() => {
    syncEditorHeight();
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function rememberEditorSelection() {
    const editorElement = editorRef.current;

    if (!editorElement) {
      return;
    }

    selectionRef.current = {
      start: editorElement.selectionStart,
      end: editorElement.selectionEnd,
    };
  }

  function insertTextAtCursor(value: string) {
    const editorElement = editorRef.current;
    const currentContent = editorElement?.value ?? content;
    const { start, end } = selectionRef.current;
    const nextContent =
      currentContent.slice(0, start) + value + currentContent.slice(end);
    const nextCursorPosition = start + value.length;

    setContent(nextContent);
    selectionRef.current = {
      start: nextCursorPosition,
      end: nextCursorPosition,
    };

    requestAnimationFrame(() => {
      if (!editorElement) {
        return;
      }

      editorElement.focus();
      editorElement.setSelectionRange(nextCursorPosition, nextCursorPosition);
      syncEditorHeight();
    });
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || isUploadingImage) {
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/v1/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setErrorMessage("이미지 업로드에 실패했습니다.");
        return;
      }

      const responseBody = (await response.json()) as {
        url?: string;
      };

      if (!responseBody.url) {
        setErrorMessage("이미지 URL을 받지 못했습니다.");
        return;
      }

      insertTextAtCursor(`\n![${file.name}](${responseBody.url})\n`);
    } catch {
      setErrorMessage("이미지 업로드에 실패했습니다.");
    } finally {
      event.target.value = "";
      setIsUploadingImage(false);
    }
  }

  function handleYoutubeInsert() {
    const normalizedUrl = youtubeUrl.trim();

    if (!normalizedUrl) {
      setErrorMessage("유튜브 URL을 입력해주세요.");
      return;
    }

    setErrorMessage(null);
    insertTextAtCursor(`\n${normalizedUrl}\n`);
    setYoutubeUrl("");
    setIsYoutubeInputVisible(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      <form
        className="post-editor-view-root"
        data-preview-visible={isPreviewVisible ? "true" : "false"}
        onSubmit={handleSubmit}
      >
        <div className="post-editor-left-column">
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

          <div className="post-editor-attachmentbar">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="post-editor-file-input"
              onChange={handleImageUpload}
            />

            <div className="post-editor-attachment-actions">
              <button
                type="button"
                className="post-editor-secondary-button"
                onClick={() => {
                  rememberEditorSelection();
                  fileInputRef.current?.click();
                }}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? "이미지 업로드 중..." : "이미지 첨부"}
              </button>
              <button
                type="button"
                className="post-editor-secondary-button"
                onClick={() => {
                  rememberEditorSelection();
                  setIsYoutubeInputVisible((current) => !current);
                }}
              >
                유튜브 첨부
              </button>
            </div>

            {isYoutubeInputVisible ? (
              <div className="post-editor-youtube-row">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  className="post-editor-youtube-input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  aria-label="YouTube URL"
                />
                <button
                  type="button"
                  className="post-editor-secondary-button"
                  onClick={handleYoutubeInsert}
                >
                  삽입
                </button>
              </div>
            ) : null}
          </div>

          <textarea
            ref={editorRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onSelect={rememberEditorSelection}
            onClick={rememberEditorSelection}
            onKeyUp={rememberEditorSelection}
            className="post-editor-markdown-editor hide-scrollbar"
            placeholder="Markdown 본문을 작성하세요."
            aria-label="Post Markdown Editor"
            spellCheck={false}
          />
          <div className="post-editor-controlpanel">
            <div className="post-editor-controlpanel-group">
              <button type="button" className="post-editor-secondary-button">
                초안 불러오기
              </button>
              <button type="button" className="post-editor-secondary-button">
                초안 등록
              </button>
              <button
                type="button"
                className="post-editor-preview-switch"
                role="switch"
                aria-checked={isPreviewVisible}
                onClick={() => setIsPreviewVisible((current) => !current)}
                data-checked={isPreviewVisible ? "true" : "false"}
                aria-label="Markdown Preview Toggle"
              >
                <span
                  className="post-editor-preview-switch-track"
                  aria-hidden="true"
                >
                  <span className="post-editor-preview-switch-thumb" />
                </span>
                <span className="post-editor-preview-switch-label">
                  프리뷰 {isPreviewVisible ? "On" : "Off"}
                </span>
              </button>
            </div>

            <div className="post-editor-controlpanel-group post-editor-controlpanel-group-right">
              <button
                type="submit"
                className="post-editor-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "저장 중..." : "제출"}
              </button>
              <button
                type="button"
                className="post-editor-secondary-button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </button>
            </div>
          </div>
        </div>

        {isPreviewVisible ? (
          <div className="post-editor-right-column">
            <div className="post-editor-markdown-preview post-detail-markdown">
              <div className="post-editor-preview-scroll hide-scrollbar">
                <PostEditorPreview content={content} />
              </div>
            </div>
          </div>
        ) : null}
      </form>

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
