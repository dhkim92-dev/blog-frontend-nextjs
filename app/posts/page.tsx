import Link from "next/link";
import {
  getCurrentServerAuthentication,
  isAdminServerAuthentication,
} from "@/app/login/server-auth";
import AdminPageGuard from "@/app/shared/admin-page-guard";
import { apiPostCategoryRepository } from "./api-post-category-repository";
import {
  dummyPostRepository,
} from "./dummy-post-repositories";
import PostEditorView from "./post-editor-view";
import PostsView from "./posts-view";
import "./posts-view.css";
import "./post-detail-view.css";
import "./post-editor-view.css";

type PostsPageProps = {
  searchParams?: Promise<{
    category?: string;
    mode?: string;
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams?.mode ?? null;
  const selectedCategoryId = resolvedSearchParams?.category ?? null;
  const authentication = await getCurrentServerAuthentication();
  const isAdmin = isAdminServerAuthentication(authentication);

  if (mode === "edit") {
    if (!isAdmin) {
      return <AdminPageGuard fallbackHref="/posts" />;
    }

    const categories = await apiPostCategoryRepository.getCategories();

    return (
      <PostEditorView categories={categories.items} initialPost={null} mode="create" />
    );
  }

  const [categories, postsPage] = await Promise.all([
    apiPostCategoryRepository.getCategories(),
    dummyPostRepository.getPosts({ categoryId: selectedCategoryId }),
  ]);
  const selectedCategoryName =
    categories.items.find((category) => category.id === selectedCategoryId)
      ?.name ?? "All";

  return (
    <section className="posts-page-root">
      <div className="posts-page-inner">
        <aside className="post-category-list-container">
          <div className="post-category-header-row">
            <Link href="/posts" className="post-category-header">
              Category
            </Link>
            {isAdmin ? (
              <Link
                href="/posts/categories/edit"
                className="post-category-manage-link"
                aria-label="카테고리 편집"
              >
                ⚙
              </Link>
            ) : null}
          </div>
          <div className="post-category-list hide-scrollbar">
            {categories.items.map((category) => {
              const isSelected = category.id === selectedCategoryId;

              return (
                <Link
                  key={category.id}
                  href={`/posts?category=${category.id}`}
                  className={`post-category-item${isSelected ? " is-selected" : ""}`}
                >
                  <span>{category.name}</span>
                  <span>{category.postCount}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="post-list-container">
          <div className="post-list-header">
            <h1>{selectedCategoryName}</h1>
            {isAdmin ? (
              <Link href="/posts?mode=edit" className="post-list-write-link">
                글쓰기
              </Link>
            ) : null}
          </div>
          <div className="post-list-divider" />
          <PostsView
            key={selectedCategoryId ?? "all"}
            initialPostsPage={postsPage}
            selectedCategoryId={selectedCategoryId}
          />
        </div>
      </div>
    </section>
  );
}
