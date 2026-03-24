export type GetMemberChurchOutput = {
  churchId: string;
  churchName: string;
  roleId: string;
  roleName: string;
  userPermission: "write" | "read" | null;
};

export type GetMemberOutput = {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  status: "Active" | "Inactive" | "Paused";
  avatarUrl: string | null;
  churches: GetMemberChurchOutput[];
};

export type GetMemberInput = {
  memberId: string;
  isSuperAdmin: boolean;
  userChurches?: {
    churchId: string;
    roleId: string | null;
    hasMemberRead: boolean;
    hasMemberWrite: boolean;
  }[];
};
