export type AuthLoginOutputDTO = {
  token: string;
  userId: string;
  email: string | null;
  isSuperAdmin: boolean;
  fullName: string | null;
  avatarUrl: string | null;
};
