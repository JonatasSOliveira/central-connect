import { type Auth, getAuth } from "firebase-admin/auth";
import type { IGoogleAuthService } from "@/modules/identity/application/ports/IGoogleAuthService";
import type { GoogleUserPayload } from "@/shared/contracts/auth";
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
