export type MemberChurchInfo = {
  churchId: string;
  churchName: string;
};

export type MemberListItem = {
  id: string;
  fullName: string;
  churches: MemberChurchInfo[];
};

export type ListMembersOutput = {
  members: MemberListItem[];
};

export type ListMembersInput = {
  isSuperAdmin: boolean;
  userChurches?: {
    churchId: string;
    roleId: string | null;
    hasMemberRead: boolean;
  }[];
  churchId: string;
  ministryId?: string;
};
