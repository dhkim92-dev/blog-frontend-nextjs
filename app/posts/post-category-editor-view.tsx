"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserDummyPostCategoryRepository,
  type PostCategoryDto,
} from "./browser-dummy-post-repositories";

type PostCategoryEditorViewProps = {
  initialCategories: PostCategoryDto[];
};

export default function PostCategoryEditorView({
  initialCategories,
}: PostCategoryEditorViewProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshCategories() {
    const nextCategories = await browserDummyPostCategoryRepository.getCategories();
    setCategories(nextCategories);
  }

  function startEditing(category: PostCategoryDto) {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setErrorMessage(null);
  }

  function cancelEditing() {
    setEditingCategoryId(null);
    setEditingName("");
  }

  async function handleCreateCategory() {
    if (isSubmitting) {
      return;
    }

    const normalizedName = newCategoryName.trim();

    if (!normalizedName || normalizedName.length > 20) {
      setErrorMessage("카테고리 이름은 1자 이상 20자 이하여야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await browserDummyPostCategoryRepository.createCategory({
        name: normalizedName,
      });

      if (result.status !== 201) {
        setErrorMessage(result.message);
        return;
      }

      setNewCategoryName("");
      await refreshCategories();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateCategory() {
    if (!editingCategoryId || isSubmitting) {
      return;
    }

    const normalizedName = editingName.trim();

    if (!normalizedName || normalizedName.length > 20) {
      setErrorMessage("카테고리 이름은 1자 이상 20자 이하여야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await browserDummyPostCategoryRepository.updateCategory(
        editingCategoryId,
        {
          name: normalizedName,
        },
      );

      if (result.status !== 200) {
        setErrorMessage(result.message);
        return;
      }

      cancelEditing();
      await refreshCategories();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result =
        await browserDummyPostCategoryRepository.deleteCategory(categoryId);

      if (result.status !== 200) {
        setErrorMessage(result.message);
        return;
      }

      if (editingCategoryId === categoryId) {
        cancelEditing();
      }

      await refreshCategories();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="post-category-editor-page-root">
      <div className="post-category-editor-view-root">
        <div className="post-category-editor-header">
          <div>
            <h1>Post Categories</h1>
            <p>카테고리 이름 변경, 삭제, 추가를 여기서 처리합니다.</p>
          </div>
        </div>

        <div className="post-category-editor-list">
          {categories.map((category) => {
            const isEditing = category.id === editingCategoryId;

            return (
              <div key={category.id} className="post-category-editor-item">
                <div className="post-category-editor-item-main">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      maxLength={20}
                      className="post-category-editor-input"
                      aria-label={`${category.name} category name`}
                    />
                  ) : (
                    <div className="post-category-editor-item-name">
                      <span>{category.name}</span>
                      <span className="post-category-editor-item-count">
                        {category.postCount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="post-category-editor-item-actions">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="post-category-editor-secondary-button"
                        onClick={handleUpdateCategory}
                        disabled={isSubmitting}
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        className="post-category-editor-secondary-button"
                        onClick={cancelEditing}
                        disabled={isSubmitting}
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="post-category-editor-icon-button"
                        onClick={() => startEditing(category)}
                        disabled={isSubmitting}
                        aria-label={`${category.name} 이름 변경`}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="post-category-editor-icon-button"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isSubmitting}
                        aria-label={`${category.name} 삭제`}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="post-category-editor-create">
          <input
            type="text"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            maxLength={20}
            className="post-category-editor-input"
            placeholder="새 카테고리 이름"
            aria-label="New category name"
          />
          <button
            type="button"
            className="post-category-editor-primary-button"
            onClick={handleCreateCategory}
            disabled={isSubmitting}
          >
            제출
          </button>
        </div>

        {errorMessage ? (
          <div className="post-category-editor-feedback" role="alert">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}
