export interface IAuthService {
  createSession(userId: string): string;
  verifySession(token: string): { userId: string };
}
