import type { GoogleUserPayload } from "@/application/dtos/auth/GoogleUserPayload";
import type { TokenPayload } from "@/application/dtos/auth/TokenPayload";

export interface IAuthService {
  verifyGoogleToken(googleToken: string): Promise<GoogleUserPayload>;
  generateToken(userId: string, email: string): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}
