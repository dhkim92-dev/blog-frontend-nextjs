"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { getApiPayload, parseApiEnvelope } from "./api-envelope";

type MarkdownEditorViewProps = {
  header?: ReactNode;
  content: string;
  onContentChange: (content: string) => void;
  contentPlaceholder: string;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  leftControls?: ReactNode;
};

const MIN_EDITOR_HEIGHT = 480;
const MAX_EDITOR_HEIGHT = 720;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
]);

type FileUploadPayload = {
  fileId: string;
  fileName: string;
  fileSize: number;
  url: string;
};

const MarkdownPreview = dynamic(() => import("./markdown-preview"), {
  ssr: false,
  loading: () => (
    <div className="post-editor-preview-empty">
      프리뷰를 불러오는 중입니다.
    </div>
  ),
});

export default function MarkdownEditorView({
  header,
  content,
  onContentChange,
  contentPlaceholder,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
  leftControls,
}: MarkdownEditorViewProps) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef({
    start: 0,
    end: 0,
  });
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isYoutubeInputVisible, setIsYoutubeInputVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    onContentChange(nextContent);
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

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setErrorMessage("JPEG, PNG, GIF 이미지만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("usage", "POST_IMAGE");

      const response = await fetch("/bff/api/v1/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setErrorMessage("이미지 업로드에 실패했습니다.");
        return;
      }

      const responseBody = await parseApiEnvelope<FileUploadPayload>(response);
      const payload = getApiPayload(responseBody);

      if (!payload?.url) {
        setErrorMessage("이미지 URL을 받지 못했습니다.");
        return;
      }

      insertTextAtCursor(`\n![${file.name}](${payload.url})\n`);
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

  return (
    <>
      <div
        className="post-editor-view-root"
        data-preview-visible={isPreviewVisible ? "true" : "false"}
      >
        <div className="post-editor-left-column">
          {header}

          <div className="post-editor-attachmentbar">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
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
            onChange={(event) => onContentChange(event.target.value)}
            onSelect={rememberEditorSelection}
            onClick={rememberEditorSelection}
            onKeyUp={rememberEditorSelection}
            className="post-editor-markdown-editor hide-scrollbar"
            placeholder={contentPlaceholder}
            aria-label="Markdown Editor"
            spellCheck={false}
          />

          <div className="post-editor-controlpanel">
            <div className="post-editor-controlpanel-group">
              {leftControls}
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
                type="button"
                className="post-editor-primary-button"
                disabled={isSubmitting}
                onClick={() => {
                  void onSubmit();
                }}
              >
                {isSubmitting ? "저장 중..." : submitLabel}
              </button>
              <button
                type="button"
                className="post-editor-secondary-button"
                onClick={onCancel}
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
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="post-editor-feedback" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </>
  );
}
