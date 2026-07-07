import PostDetailMarkdown from "@/app/posts/post-detail-markdown";
import "@/app/posts/post-detail-view.css";
import "@/app/posts/post-editor-view.css";
import {
  getCurrentServerAuthentication,
  isAdminServerAuthentication,
} from "@/app/login/server-auth";
import AdminPageGuard from "@/app/shared/admin-page-guard";
import { apiResumeRepository } from "./api-resume-repository";
import ResumeActions from "./resume-actions";
import ResumeEditorView from "./resume-editor-view";
import "./resume-view.css";

type ResumePageProps = {
  searchParams?: Promise<{
    mode?: string;
  }>;
};

function formatResumeDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default async function ResumePage({ searchParams }: ResumePageProps) {
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams?.mode ?? null;
  const authentication = await getCurrentServerAuthentication();
  const isAdmin = isAdminServerAuthentication(authentication);
  const resume = await apiResumeRepository.getResume();

  if (mode === "edit") {
    if (!isAdmin) {
      return <AdminPageGuard fallbackHref="/resume" />;
    }

    return <ResumeEditorView initialResume={resume} />;
  }

  return (
    <section className="resume-page-root">
      <div className="resume-view-root">
        <div className="resume-header">
          <div className="resume-heading">
            <div className="resume-eyebrow">Resume</div>
            {resume ? (
              <div className="resume-meta">
                최근 수정 {formatResumeDate(resume.updatedAt)}
              </div>
            ) : (
              <div className="resume-meta">등록된 이력서가 없습니다.</div>
            )}
          </div>
          <ResumeActions hasResume={resume !== null} canManage={isAdmin} />
        </div>

        {resume ? (
          <div className="resume-body post-detail-markdown">
            <PostDetailMarkdown content={resume.content} />
          </div>
        ) : (
          <div className="resume-empty-state">
            이력서를 추가하면 여기에 표시됩니다.
          </div>
        )}
      </div>
    </section>
  );
}
