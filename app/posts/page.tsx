import Link from "next/link";
import {
  dummyPostCategoryRepository,
  dummyPostRepository,
} from "./dummy-post-repositories";
import PostsView from "./posts-view";
import "./posts-view.css";

type PostsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedCategoryId = resolvedSearchParams?.category ?? null;
  const [categories, postsPage] = await Promise.all([
    dummyPostCategoryRepository.getCategories(),
    dummyPostRepository.getPosts({ categoryId: selectedCategoryId }),
  ]);
  const selectedCategoryName =
    categories.items.find((category) => category.id === selectedCategoryId)
      ?.name ?? "All";

  return (
    <section className="posts-page-root">
      <div className="posts-page-inner">
        <aside className="post-category-list-container">
          <Link href="/posts" className="post-category-header">
            Category
          </Link>
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
