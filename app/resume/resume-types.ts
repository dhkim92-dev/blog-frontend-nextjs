export type ResumeDetailDto = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type SaveResumeRequestDto = {
  content: string;
};
