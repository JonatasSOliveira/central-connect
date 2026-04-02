import type { Result } from "@/shared/types/Result";
import type { AuthLoginOutputDTO } from "../dtos/auth/AuthLoginOutputDTO";

export interface CurrentUserChurch {
  churchId: string;
  roleId: string | null;
}

export interface CurrentUser {
  userId: string;
  memberId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  churchId: string | null;
  churchName: string | null;
  churches: CurrentUserChurch[];
  permissions: string[];
}

export class AuthService {
  async login(googleToken: string): Promise<Result<AuthLoginOutputDTO>> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        ok: false,
        error: {
          code: data.error?.code ?? "UNKNOWN_ERROR",
          message:
            data.error?.message ?? "Erro ao fazer login. Tente novamente",
        },
      };
    }

    return { ok: true, value: data.value };
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.value ?? null;
  }

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  }

  async selectChurch(churchId: string): Promise<Result<{ success: boolean }>> {
    const response = await fetch("/api/auth/select-church", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ churchId }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        ok: false,
        error: {
          code: data.error?.code ?? "SELECT_CHURCH_FAILED",
          message:
            data.error?.message ?? "Erro ao selecionar igreja. Tente novamente",
        },
      };
    }

    return { ok: true, value: { success: true } };
  }
}

export const authService = new AuthService();
