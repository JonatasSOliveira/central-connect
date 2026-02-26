import { GoogleUserPayloadDTO } from "@/application/dtos/auth/GoogleUserPayload.dto";

export interface IGoogleTokenVerifier {
  verify(idToken: string): Promise<GoogleUserPayloadDTO>;
}
