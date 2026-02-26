import { SignInWithGoogleInputDTO } from "@/application/dtos/auth/SignInWithGoogle.input.dto";
import { Result } from "@/shared/result/Result";

export class AuthApiClient {
  public async signin(user: SignInWithGoogleInputDTO): Promise<Result<string>> {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    return response.json();
  }
}
