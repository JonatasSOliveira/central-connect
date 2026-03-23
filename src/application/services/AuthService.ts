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
  churches: CurrentUserChurch[];
  permissions: string[];
}

export class AuthService {
  async login(googleToken: string): Promise<AuthLoginOutputDTO> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.code ?? "LOGIN_FAILED");
    }

    return data.value;
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

  async selectChurch(churchId: string): Promise<void> {
    const response = await fetch("/api/auth/select-church", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ churchId }),
    });

    if (!response.ok) {
      throw new Error("SELECT_CHURCH_FAILED");
    }
  }
}

export const authService = new AuthService();
