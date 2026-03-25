export type MemberChurchInfo = {
  churchId: string;
  churchName: string;
};

export type MemberListItem = {
  id: string;
  fullName: string;
  churches: MemberChurchInfo[];
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ListMembersOutput = {
  members: MemberListItem[];
  pagination: PaginationInfo;
};

export type ListMembersInput = {
  isSuperAdmin: boolean;
  userChurches?: {
    churchId: string;
    roleId: string | null;
    hasMemberRead: boolean;
  }[];
  churchId: string;
  search?: string;
  page?: number;
  limit?: number;
};
