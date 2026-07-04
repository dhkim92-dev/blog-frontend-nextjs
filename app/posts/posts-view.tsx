"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  browserDummyPostRepository,
  type PostCursorPageDto,
  type PostListItemDto,
} from "./dummy-post-repositories";

type PostsViewProps = {
  initialPostsPage: PostCursorPageDto;
  selectedCategoryId: string | null;
};

function formatDate(value: string) {
  return value.slice(0, 10);
}

export default function PostsView({
  initialPostsPage,
  selectedCategoryId,
}: PostsViewProps) {
  const [posts, setPosts] = useState<PostListItemDto[]>(initialPostsPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialPostsPage.nextCursor,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastPostRef = useRef<HTMLAnchorElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  const loadMorePosts = useCallback(
    async (cursor: string) => {
      if (isLoadingMoreRef.current) {
        return;
      }

      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);

      try {
        const nextPostsPage = await browserDummyPostRepository.getPosts({
          categoryId: selectedCategoryId,
          cursor,
        });

        setPosts((current) => [...current, ...nextPostsPage.items]);
        setNextCursor(nextPostsPage.nextCursor);
      } finally {
        setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
      }
    },
    [selectedCategoryId],
  );

  useEffect(() => {
    const lastPostElement = lastPostRef.current;

    if (!lastPostElement || !nextCursor || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();
        await loadMorePosts(nextCursor);
      },
      { rootMargin: "0px 0px 180px 0px" },
    );

    observer.observe(lastPostElement);

    return () => observer.disconnect();
  }, [isLoadingMore, loadMorePosts, nextCursor, posts]);

  return (
    <>
      <div className="post-list-items">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            ref={index === posts.length - 1 ? lastPostRef : null}
            className="post-list-item"
          >
            <h2>{post.title}</h2>
            <div className="post-list-item-meta">
              <span>{post.category.name}</span>
              <span>
                by {post.writer.nickname} | {formatDate(post.createdAt)}
              </span>
            </div>
          </Link>
        ))}
        {posts.length === 0 ? (
          <div className="post-list-empty">No posts found.</div>
        ) : null}
      </div>

      {isLoadingMore ? (
        <div className="post-list-loading-indicator" aria-live="polite">
          <span className="post-list-spinner" aria-hidden="true" />
        </div>
      ) : null}
    </>
  );
}
