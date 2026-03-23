export interface ChurchInfo {
  churchId: string;
  roleId: string | null;
}

export type AuthLoginOutputDTO = {
  userId: string;
  memberId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  churches: ChurchInfo[];
  permissions: string[];
  sessionToken: string;
};
