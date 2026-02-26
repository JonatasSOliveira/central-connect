import { IGoogleTokenVerifier } from "@/domain/ports/auth/IGoogleTokenVerifier.port";
import { auth } from "../admin";
import { GoogleUserPayloadDTO } from "@/application/dtos/auth/GoogleUserPayload.dto";

export class FirebaseGoogleTokenVerifier implements IGoogleTokenVerifier {
  public async verify(idToken: string): Promise<GoogleUserPayloadDTO> {
    const decoded = await auth.verifyIdToken(idToken);
    return {
      email: decoded.email!,
      name: decoded.name,
      picture: decoded.picture,
    };
  }
}
