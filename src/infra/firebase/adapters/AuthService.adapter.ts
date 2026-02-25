import { AuthService } from "@/domain/ports/auth/AuthService.port";
import { getAuth } from "firebase-admin/auth";

export class FirebaseAuthServiceAdapter implements AuthService {
  async createUser(email: string, password: string): Promise<string> {
    const existingUser = await getAuth()
      .getUserByEmail(email)
      .catch(() => null);

    if (existingUser) throw new Error("Usuário já existe");

    const userRecord = await getAuth().createUser({ email, password });
    return userRecord.uid; // só retorna o ID pro domínio
  }

  async authenticate(email: string, password: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    const data = await response.json();

    if (data.error) {
      throw new Error("Credenciais inválidas");
    }

    return data.localId;
  }
}
