import {
  dummyPostCategoryRepository,
} from "@/app/posts/dummy-post-repositories";
import PostCategoryEditorView from "@/app/posts/post-category-editor-view";
import "@/app/posts/post-category-editor-view.css";

export default async function PostCategoryEditPage() {
  const categories = await dummyPostCategoryRepository.getCategories();

  return <PostCategoryEditorView initialCategories={categories.items} />;
}
