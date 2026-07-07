export type MemberProfileDto = {
  id: string;
  nickname: string;
  createdAt: string;
  isDeleted: boolean;
};

export type MemberAuthAccountDto = {
  email: {
    address: string;
    createdAt: string;
    verified: boolean;
  } | null;
  oauth: {
    provider: string;
    userId: string;
  } | null;
};

export type SaveMemberProfileRequestDto = {
  nickname: string;
};
