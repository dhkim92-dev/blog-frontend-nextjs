import { notFound } from "next/navigation";
import {
  dummyPostRepository,
  type PostDetailDto,
} from "@/app/posts/dummy-post-repositories";
import PostDetailMarkdown from "@/app/posts/post-detail-markdown";
import "../post-detail-view.css";

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

function formatPostDate(value: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(value));
  const getValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getValue("year")}년 ${getValue("month")}월 ${getValue("day")}일 ${getValue("hour")}:${getValue("minute")}:${getValue("second")}`;
}

function PostDetailTitle({ post }: { post: PostDetailDto }) {
  const canManagePost = false;

  return (
    <div className="post-detail-title">
      <div className="post-detail-title-top">
        <div className="post-detail-category">{post.category.name}</div>
        <div
          className="post-detail-actions"
          data-visible={canManagePost ? "true" : "false"}
        >
          <span>수정</span>
          <span>|</span>
          <span>삭제</span>
        </div>
      </div>
      <h1 className="post-detail-title-heading">{post.title}</h1>
      <div className="post-detail-title-meta">
        by {post.writer.nickname} · {formatPostDate(post.createdAt)}
      </div>
    </div>
  );
}

export default async function PostDetailPage({
  params,
}: PostDetailPageProps) {
  const { postId } = await params;
  const post = await dummyPostRepository.getPostById(postId);

  if (!post) {
    notFound();
  }

  return (
    <section className="post-detail-page-root">
      <div className="post-detail-view-root">
        <PostDetailTitle post={post} />
        <div className="post-detail-markdown">
          <PostDetailMarkdown content={post.content} />
        </div>
      </div>
    </section>
  );
}
