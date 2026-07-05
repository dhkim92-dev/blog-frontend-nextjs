import {
  getCurrentServerAuthentication,
  isAdminServerAuthentication,
} from "@/app/login/server-auth";
import AdminPageGuard from "@/app/shared/admin-page-guard";
import {
  dummyPostCategoryRepository,
} from "@/app/posts/dummy-post-repositories";
import PostCategoryEditorView from "@/app/posts/post-category-editor-view";
import "@/app/posts/post-category-editor-view.css";

export default async function PostCategoryEditPage() {
  const authentication = await getCurrentServerAuthentication();

  if (!isAdminServerAuthentication(authentication)) {
    return <AdminPageGuard fallbackHref="/posts" />;
  }

  const categories = await dummyPostCategoryRepository.getCategories();

  return <PostCategoryEditorView initialCategories={categories.items} />;
}
