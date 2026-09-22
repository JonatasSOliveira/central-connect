import type { GoogleUserPayload } from "@/shared/contracts/auth";

export interface IGoogleAuthService {
  verifyGoogleToken(googleToken: string): Promise<GoogleUserPayload>;
}
