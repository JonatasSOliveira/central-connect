import { jwtVerify, SignJWT } from "jose";
import type { TokenPayload } from "@/application/dtos/auth/TokenPayload";
import type { ITokenService } from "@/domain/ports/ITokenService";

export class JoseTokenJwtService implements ITokenService {
  private readonly secret: Uint8Array;
  private readonly expirationTime: string = "7 days";

  constructor() {
    this.secret = new TextEncoder().encode(process.env.JWT_SECRET);
  }

  async generateToken(userId: string, email: string): Promise<string> {
    const jwt = new SignJWT({ userId, email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.expirationTime);

    return jwt.sign(this.secret);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  }
}
