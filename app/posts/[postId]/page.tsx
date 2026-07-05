import { notFound } from "next/navigation";
import {
  dummyPostCategoryRepository,
  dummyPostRepository,
  type PostDetailDto,
} from "@/app/posts/dummy-post-repositories";
import PostDetailActions from "@/app/posts/post-detail-actions";
import PostDetailMarkdown from "@/app/posts/post-detail-markdown";
import PostEditorView from "@/app/posts/post-editor-view";
import "../post-detail-view.css";
import "../post-editor-view.css";

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    mode?: string;
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
  return (
    <div className="post-detail-title">
      <div className="post-detail-title-top">
        <div className="post-detail-category">{post.category.name}</div>
        <PostDetailActions postId={post.id} />
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
  searchParams,
}: PostDetailPageProps) {
  const { postId } = await params;
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams?.mode ?? null;

  if (mode === "edit") {
    const [categories, post] = await Promise.all([
      dummyPostCategoryRepository.getCategories(),
      dummyPostRepository.getPostById(postId),
    ]);

    if (!post) {
      notFound();
    }

    return (
      <PostEditorView
        categories={categories.items}
        initialPost={post}
        mode="edit"
      />
    );
  }

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
