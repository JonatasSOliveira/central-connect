import { jwtVerify, SignJWT } from "jose";
import type { ITokenService } from "@/domain/ports/ITokenService";

export class JoseTokenJwtService implements ITokenService {
  private readonly secret: Uint8Array;
  private readonly expirationTime: string = "7 days";
  private readonly issuer: string;
  private readonly audience: string;

  constructor() {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET must be set with at least 32 characters");
    }

    this.secret = new TextEncoder().encode(secret);
    this.issuer = process.env.JWT_ISSUER ?? "central-connect";
    this.audience = process.env.JWT_AUDIENCE ?? "central-connect-app";
  }

  async generateToken(payload: Record<string, unknown>): Promise<string> {
    const jwt = new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.expirationTime);

    return jwt.sign(this.secret);
  }

  async verifyToken(token: string): Promise<Record<string, unknown>> {
    const { payload } = await jwtVerify(token, this.secret, {
      issuer: this.issuer,
      audience: this.audience,
    });

    return payload as Record<string, unknown>;
  }
}
