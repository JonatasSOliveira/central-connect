import type { TokenPayload } from "@/application/dtos/auth/TokenPayload";

export interface ITokenService {
  generateToken(userId: string, email: string): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}
