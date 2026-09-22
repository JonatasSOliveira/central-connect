export interface ChurchInfo {
  churchId: string;
  roleId: string | null;
}

export interface SessionPayload {
  userId: string;
  memberId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  churchId: string | null;
  churchName: string | null;
  churches: ChurchInfo[];
  permissions: string[];
}

export interface AuthSuccess {
  ok: true;
  user: SessionPayload;
}

export interface AuthError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type AuthResult = AuthSuccess | AuthError;

export interface GoogleUserPayload {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

export interface TokenPayload {
  userId: string;
  memberId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  churchId: string | null;
  permissions: string[];
}
