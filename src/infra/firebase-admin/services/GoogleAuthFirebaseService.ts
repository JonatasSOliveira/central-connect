import { type Auth, getAuth } from "firebase-admin/auth";
import type { GoogleUserPayload } from "@/application/dtos/auth/GoogleUserPayload";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import { getFirebaseApp } from "../firebaseConfig";

export class GoogleAuthFirebaseService implements IGoogleAuthService {
  private readonly auth: Auth;

  constructor() {
    this.auth = getAuth(getFirebaseApp());
  }

  async verifyGoogleToken(googleToken: string): Promise<GoogleUserPayload> {
    const decodedToken = await this.auth.verifyIdToken(googleToken);

    return {
      email: decodedToken.email ?? "",
      name: decodedToken.name ?? undefined,
      picture: decodedToken.picture ?? undefined,
      sub: decodedToken.sub ?? "",
    };
  }
}
