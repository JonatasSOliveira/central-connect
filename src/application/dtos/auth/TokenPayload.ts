export interface TokenPayload {
  userId: string;
  email: string;
  churchId?: string;
  roleId?: string;
  isSuperUser?: boolean;
}
