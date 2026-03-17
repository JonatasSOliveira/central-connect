import type { GoogleUserPayload } from "@/application/dtos/auth/GoogleUserPayload";

export interface IGoogleAuthService {
  verifyGoogleToken(googleToken: string): Promise<GoogleUserPayload>;
}
