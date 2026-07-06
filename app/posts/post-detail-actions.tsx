"use client";

import Link from "next/link";
import { useCommandLoading } from "@/app/shared/command-loading-provider";
import { browserDummyPostRepository } from "./browser-dummy-post-repositories";

type PostDetailActionsProps = {
  postId: string;
};

export default function PostDetailActions({
  postId,
}: PostDetailActionsProps) {
  const { startCommand } = useCommandLoading();

  async function handleDelete() {
    const shouldDelete = window.confirm("게시물을 삭제하시겠습니까?");

    if (!shouldDelete) {
      return;
    }

    const command = startCommand();
    const result = await browserDummyPostRepository.deletePost(postId);

    if (result.status !== 200 && result.status !== 204) {
      await command.dismiss();
      window.alert(result.message || "게시물 삭제에 실패했습니다.");
      return;
    }

    await command.redirect("/posts");
  }

  return (
    <div className="post-detail-actions">
      <Link href={`/posts/${postId}?mode=edit`} className="post-detail-action-link">
        수정
      </Link>
      <span className="post-detail-action-divider">·</span>
      <button
        type="button"
        className="post-detail-action-button"
        onClick={handleDelete}
      >
        삭제
      </button>
    </div>
  );
}
