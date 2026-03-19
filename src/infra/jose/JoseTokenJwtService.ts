import { jwtVerify, SignJWT } from "jose";
import type { ITokenService } from "@/domain/ports/ITokenService";

export class JoseTokenJwtService implements ITokenService {
  private readonly secret: Uint8Array;
  private readonly expirationTime: string = "7 days";

  constructor() {
    this.secret = new TextEncoder().encode(process.env.JWT_SECRET);
  }

  async generateToken(payload: Record<string, unknown>): Promise<string> {
    const jwt = new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.expirationTime);

    return jwt.sign(this.secret);
  }

  async verifyToken(token: string): Promise<Record<string, unknown>> {
    const { payload } = await jwtVerify(token, this.secret);
    return payload as Record<string, unknown>;
  }
}
