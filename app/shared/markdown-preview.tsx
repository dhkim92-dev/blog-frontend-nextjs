"use client";

import { Component, type ReactNode } from "react";
import PostDetailMarkdown from "@/app/posts/post-detail-markdown";

type MarkdownPreviewProps = {
  content: string;
};

class MarkdownPreviewErrorBoundary extends Component<
  {
    children: ReactNode;
  },
  {
    hasError: boolean;
  }
> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidUpdate(previousProps: { children: ReactNode }) {
    if (previousProps.children !== this.props.children && this.state.hasError) {
      this.setState({
        hasError: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="post-editor-preview-error" role="alert">
          마크다운 프리뷰를 렌더링하지 못했습니다.
        </div>
      );
    }

    return this.props.children;
  }
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <MarkdownPreviewErrorBoundary>
      {content.trim().length > 0 ? (
        <PostDetailMarkdown content={content} />
      ) : (
        <div className="post-editor-preview-empty">
          미리보기가 여기에 표시됩니다.
        </div>
      )}
    </MarkdownPreviewErrorBoundary>
  );
}
