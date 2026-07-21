"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { getApiPayload, parseApiEnvelope } from "./api-envelope";
import { browserAuthFetch } from "./browser-auth-fetch";
import ErrorToast, { type ErrorToastState } from "./error-toast";

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
const MIN_EDITOR_COLUMN_WIDTH = 360;
const MIN_PREVIEW_COLUMN_WIDTH = 360;
const PREVIEW_RESIZER_WIDTH = 12;
const PREVIEW_COLUMN_GAP = 12;
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
  const editorLayoutRef = useRef<HTMLDivElement | null>(null);
  const editorColumnRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewResizeRef = useRef<{
    startX: number;
    startWidth: number;
  } | null>(null);
  const selectionRef = useRef({
    start: 0,
    end: 0,
  });
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewEditorRatio, setPreviewEditorRatio] = useState<number | null>(
    null,
  );
  const [isPreviewResizing, setIsPreviewResizing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isYoutubeInputVisible, setIsYoutubeInputVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [errorToast, setErrorToast] = useState<ErrorToastState | null>(null);

  function showErrorToast(message: string) {
    setErrorToast({
      id: Date.now(),
      message,
    });
  }

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

  function getPreviewPaneWidth() {
    const layoutElement = editorLayoutRef.current;

    if (!layoutElement) {
      return null;
    }

    return (
      layoutElement.getBoundingClientRect().width -
      PREVIEW_RESIZER_WIDTH -
      PREVIEW_COLUMN_GAP * 2
    );
  }

  function handlePreviewResizeStart(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const editorColumnElement = editorColumnRef.current;
    const previewPaneWidth = getPreviewPaneWidth();

    if (
      !editorColumnElement ||
      previewPaneWidth === null ||
      previewPaneWidth < MIN_EDITOR_COLUMN_WIDTH + MIN_PREVIEW_COLUMN_WIDTH
    ) {
      return;
    }

    event.preventDefault();
    previewResizeRef.current = {
      startX: event.clientX,
      startWidth: editorColumnElement.getBoundingClientRect().width,
    };
    setIsPreviewResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePreviewResizeMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const resizeState = previewResizeRef.current;
    const previewPaneWidth = getPreviewPaneWidth();

    if (!resizeState || previewPaneWidth === null) {
      return;
    }

    const maxEditorWidth = previewPaneWidth - MIN_PREVIEW_COLUMN_WIDTH;
    const nextEditorWidth = Math.min(
      Math.max(
        resizeState.startWidth + event.clientX - resizeState.startX,
        MIN_EDITOR_COLUMN_WIDTH,
      ),
      maxEditorWidth,
    );

    setPreviewEditorRatio(nextEditorWidth / previewPaneWidth);
  }

  function handlePreviewResizeEnd(event: ReactPointerEvent<HTMLDivElement>) {
    previewResizeRef.current = null;
    setIsPreviewResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

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
      showErrorToast("JPEG, PNG, GIF 이미지만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    setErrorToast(null);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("usage", "POST_IMAGE");

      const response = await browserAuthFetch("/bff/api/v1/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        showErrorToast("이미지 업로드에 실패했습니다.");
        return;
      }

      const responseBody = await parseApiEnvelope<FileUploadPayload>(response);
      const payload = getApiPayload(responseBody);

      if (!payload?.url) {
        showErrorToast("이미지 URL을 받지 못했습니다.");
        return;
      }

      insertTextAtCursor(`\n![${file.name}](${payload.url})\n`);
    } catch {
      showErrorToast("이미지 업로드에 실패했습니다.");
    } finally {
      event.target.value = "";
      setIsUploadingImage(false);
    }
  }

  function handleYoutubeInsert() {
    const normalizedUrl = youtubeUrl.trim();

    if (!normalizedUrl) {
      showErrorToast("유튜브 URL을 입력해주세요.");
      return;
    }

    setErrorToast(null);
    insertTextAtCursor(`\n${normalizedUrl}\n`);
    setYoutubeUrl("");
    setIsYoutubeInputVisible(false);
  }

  return (
    <>
      <div
        ref={editorLayoutRef}
        className="post-editor-view-root"
        data-preview-visible={isPreviewVisible ? "true" : "false"}
        data-preview-resizing={isPreviewResizing ? "true" : "false"}
        style={
          isPreviewVisible && previewEditorRatio !== null
            ? {
                gridTemplateColumns: `minmax(${MIN_EDITOR_COLUMN_WIDTH}px, ${previewEditorRatio}fr) ${PREVIEW_RESIZER_WIDTH}px minmax(${MIN_PREVIEW_COLUMN_WIDTH}px, ${1 - previewEditorRatio}fr)`,
              }
            : undefined
        }
      >
        <div ref={editorColumnRef} className="post-editor-left-column">
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
          <>
            <div
              className="post-editor-preview-resizer"
              role="separator"
              aria-label="에디터와 프리뷰 영역 크기 조절"
              aria-orientation="vertical"
              onPointerDown={handlePreviewResizeStart}
              onPointerMove={handlePreviewResizeMove}
              onPointerUp={handlePreviewResizeEnd}
              onPointerCancel={handlePreviewResizeEnd}
            />
            <div className="post-editor-right-column">
              <div className="post-editor-markdown-preview post-detail-markdown">
                <div className="post-editor-preview-scroll hide-scrollbar">
                  <MarkdownPreview content={content} />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <ErrorToast
        toast={errorToast}
        onClear={(toastId) => {
          setErrorToast((current) => (current?.id === toastId ? null : current));
        }}
      />
    </>
  );
}
