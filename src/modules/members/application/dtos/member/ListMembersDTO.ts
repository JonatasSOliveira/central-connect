export type MemberChurchInfo = {
  churchId: string;
  churchName: string;
};

export type MemberMinistryRoleInfo = {
  ministryRoleId: string;
  roleName: string;
};

export type MemberListItem = {
  id: string;
  fullName: string;
  churches: MemberChurchInfo[];
  ministryRoles?: MemberMinistryRoleInfo[];
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
  churchName?: string;
  ministryId?: string;
};
