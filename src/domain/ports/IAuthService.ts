export interface IAuthService {
  verifyGoogleToken(googleToken: string): Promise<GoogleUserPayload>;
  generateToken(userId: string, email: string): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}

export interface GoogleUserPayload {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}
