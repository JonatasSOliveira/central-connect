export type GetMemberChurchOutput = {
  churchId: string;
  churchName: string;
  roleId: string;
  roleName: string;
  userPermission: "write" | "read" | null;
  ministryIds: string[];
};

export type GetMemberAvailabilityOutput = {
  mode: "ALLOW_LIST" | "BLOCK_LIST";
  daysOfWeek: (
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
  )[];
};

export type GetMemberOutput = {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  status: "Active" | "Inactive" | "Paused";
  avatarUrl: string | null;
  availability: GetMemberAvailabilityOutput | null;
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
