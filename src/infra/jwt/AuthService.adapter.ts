import jwt, { JwtPayload } from "jsonwebtoken";
import { IAuthService } from "@/domain/ports/auth/IAuthService.port";

type SessionPayload = JwtPayload & {
  sub: string; // userId
};

export class JwtAuthServiceAdapter implements IAuthService {
  private readonly secret = process.env.JWT_SECRET!;
  private readonly expiresIn = "15m";

  createSession(userId: string): string {
    return jwt.sign({}, this.secret, {
      subject: userId,
      expiresIn: this.expiresIn,
    });
  }

  verifySession(token: string): { userId: string } {
    const payload = jwt.verify(token, this.secret) as SessionPayload;

    if (!payload.sub) {
      throw new Error("Invalid session token");
    }

    return {
      userId: payload.sub,
    };
  }
}
